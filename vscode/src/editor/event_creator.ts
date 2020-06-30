import {
  TextDocumentChangeEvent,
  TextEditorSelectionChangeEvent,
  TextEditor,
  TextEditorVisibleRangesChangeEvent,
} from 'vscode';

import {
  CODIO_TEXT_CHANGED,
  CODIO_VISIBLE_RANGE_CHANGED,
  CODIO_SELECTION_CHANGED,
  CODIO_EXEC,
  CODIO_EDITOR_CHANGED,
} from './consts';

export function createCodioTextEvent(e: TextDocumentChangeEvent): CodioTextEvent {
  if (e.document.uri.scheme !== 'output') {
    return {
      type: CODIO_TEXT_CHANGED,
      data: {
        uri: e.document.uri,
        changes: e.contentChanges,
        time: Date.now(),
      },
    };
  }
}

export function createCodioVisibleRangeEvent(e: TextEditorVisibleRangesChangeEvent): CodioVisibleRangeEvent {
  if (e.textEditor.document.uri.scheme !== 'output') {
    return {
      type: CODIO_VISIBLE_RANGE_CHANGED,
      data: {
        time: Date.now(),
        uri: e.textEditor.document.uri,
        //@TODO: Currently does not support folding.
        visibleRange: e.visibleRanges[0],
      },
    };
  }
}

export function createCodioSelectionEvent(e: TextEditorSelectionChangeEvent): CodioSelectionEvent {
  if (e.textEditor.document.uri.scheme !== 'output') {
    return {
      type: CODIO_SELECTION_CHANGED,
      data: {
        uri: e.textEditor.document.uri,
        selections: e.selections,
        time: Date.now(),
      },
    };
  }
}

export function createCodioExecutionEvent(output: string): CodioExecutionEvent {
  return {
    type: CODIO_EXEC,
    data: {
      executionOutput: output,
      time: Date.now(),
    },
  };
}

export function createCodioEditorEvent(
  e: TextEditor,
  content: string,
  isInitial: boolean,
): CodioChangeActiveEditorEvent {
  return {
    type: CODIO_EDITOR_CHANGED,
    data: {
      uri: e.document.uri,
      isInitial,
      content,
      viewColumn: e.viewColumn,
      visibleRange: e.visibleRanges[0],
      selections: e.selections,
      time: Date.now(),
    },
  };
}

export function isTextEvent(event: CodioEvent): event is CodioTextEvent {
  return event.type === CODIO_TEXT_CHANGED;
}

export function isSerializedTextEvent(event: CodioSerializedEvent): event is CodioSerializedTextEvent {
  return event.type === CODIO_TEXT_CHANGED;
}

export function isSelectionEvent(event: CodioEvent): event is CodioSelectionEvent {
  return event.type === CODIO_SELECTION_CHANGED;
}

export function isSerializedSelectionEvent(event: CodioEvent): event is CodioSerializedSelectionEvent {
  return event.type === CODIO_SELECTION_CHANGED;
}

export function isVisibleRangeEvent(event: CodioEvent): event is CodioVisibleRangeEvent {
  return event.type === CODIO_VISIBLE_RANGE_CHANGED;
}

export function isSerializedVisibleRangeEvent(event: CodioSerializedEvent): event is CodioSerializedVisibleRangeEvent {
  return event.type === CODIO_VISIBLE_RANGE_CHANGED;
}

export function isExecutionEvent(event: CodioEvent): event is CodioExecutionEvent | CodioSerializedExecutionEvent {
  return event.type === CODIO_EXEC;
}

export function isEditorEvent(event): event is CodioChangeActiveEditorEvent {
  return event.type === CODIO_EDITOR_CHANGED;
}

export function isSerializedEditorEvent(event): event is CodioSerializedChangeActiveEditorEvent {
  return event.type === CODIO_EDITOR_CHANGED;
}
