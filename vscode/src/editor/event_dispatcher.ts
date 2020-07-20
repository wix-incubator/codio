import * as vscode from 'vscode';
import { cursorStyle } from '../user_interface/Viewers';
import { overrideEditorText, getTextEditor } from '../utils';
import { isTextEvent, isSelectionEvent, isVisibleRangeEvent, isExecutionEvent, isEditorEvent } from './event_creator';

export default async function dispatchEvent(event: CodioEvent) {
  try {
    if (isTextEvent(event)) {
      await dispatchTextEvent(event);
    } else if (isSelectionEvent(event)) {
      dispatchSelectionEvent(event);
    } else if (isVisibleRangeEvent(event)) {
      dispatchVisibleRangeEvent(event);
    } else if (isExecutionEvent(event)) {
      dispatchExecutionEvent(event);
    } else if (isEditorEvent(event)) {
      await dispatchEditorEvent(event);
    }
  } catch (e) {
    console.log('Failed to dispatch codio action', e);
  }
}

async function dispatchTextEvent(event: CodioTextEvent) {
  const actions = event.data.changes;
  const edit = new vscode.WorkspaceEdit();
  actions.forEach((action) => {
    if (action.position) {
      edit.replace(event.data.uri, new vscode.Range(action.position, action.position), action.value);
    } else if (action.range) {
      edit.replace(event.data.uri, action.range, action.value);
    }
  });
  await vscode.workspace.applyEdit(edit);
}

function dispatchSelectionEvent(event: CodioSelectionEvent) {
  const RangesToDecorate = event.data.selections.map((selection: vscode.Selection) => {
    return new vscode.Range(selection.anchor, selection.active);
  });
  const textDocumentToDecorate: vscode.TextEditor = vscode.window.visibleTextEditors.find(
    (editor) => editor.document.uri.path === event.data.uri.path,
  );
  if (textDocumentToDecorate) {
    textDocumentToDecorate.setDecorations(cursorStyle, RangesToDecorate);
  } else {
    //todo, open file?
    console.log(event);
  }
}

function dispatchVisibleRangeEvent(event: CodioVisibleRangeEvent) {
  const textEditor: vscode.TextEditor = vscode.window.visibleTextEditors.find(
    (editor) => editor.document.uri.path === event.data.uri.path,
  );
  if (textEditor) {
    textEditor.revealRange(event.data.visibleRange);
  }
}

function dispatchExecutionEvent(event: CodioExecutionEvent) {
  try {
    const outputChannel = vscode.window.createOutputChannel('codioReplay');
    outputChannel.show(true);
    outputChannel.append(event.data.executionOutput);
  } catch (e) {
    console.log('output error', e);
  }
}

function isEditorShownForFirstTime(event: CodioChangeActiveEditorEvent) {
  return !!event.data.isInitial;
}

async function dispatchEditorShownFirstTime(event: CodioChangeActiveEditorEvent) {
  await vscode.window.showTextDocument(event.data.uri, {
    viewColumn: event.data.viewColumn,
    preview: true,
  });
  const textEditor: vscode.TextEditor = vscode.window.visibleTextEditors.find(
    (editor) => editor.document.uri.path === event.data.uri.path,
  );
  console.log(textEditor);
  if (textEditor) {
    overrideEditorText(textEditor, event.data.content);
  }
}

async function dispatchEditorEvent(event: CodioChangeActiveEditorEvent) {
  if (isEditorShownForFirstTime(event)) {
    dispatchEditorShownFirstTime(event);
  } else {
    const textEditor: vscode.TextEditor = getTextEditor(event.data.uri.path);
    if (textEditor) {
      try {
        if (textEditor.viewColumn === event.data.viewColumn) {
          await vscode.window.showTextDocument(textEditor.document, {
            viewColumn: event.data.viewColumn,
            preview: true,
          });
        } else {
          await vscode.workspace.saveAll();
          await vscode.window.showTextDocument(textEditor.document, {
            viewColumn: textEditor.viewColumn,
          });
          await vscode.commands.executeCommand('workbench.action.closeActiveEditor');
          await vscode.window.showTextDocument(textEditor.document, {
            viewColumn: event.data.viewColumn,
            preview: true,
          });
        }
        textEditor.revealRange(event.data.visibleRange);
      } catch (e) {
        console.log('bagabaga faillll', { e, event });
      }
    } else {
      await vscode.window.showTextDocument(event.data.uri, {
        viewColumn: event.data.viewColumn,
        preview: true,
      });
      const textEditor = getTextEditor(event.data.uri.path);
      textEditor.revealRange(event.data.visibleRange);
    }
  }
}

export function removeSelection() {
  vscode.window.visibleTextEditors.map((editor) => {
    editor.setDecorations(cursorStyle, []);
  });
}
