import { workspace, window, TextEditor, TextDocumentChangeEvent, TextEditorSelectionChangeEvent, Disposable, TextEditorVisibleRangesChangeEvent, Uri} from 'vscode';
import serializeEvents from '../editor/serialize';
import * as eventCreators from '../editor/event_creator';
import FSManager from '../filesystem/FSManager';
import {exec} from "child_process";
import { createRelativeTimeline } from '../editor/event_timeline';
import ShadowDocument from '../editor/frame/ShadowDocument';
import serializeFrame from '../editor/frame/serialize_frame';

export default class CodeEditorRecorder {
    onDocumentTextChangedListener: Disposable;
    onDidChangeActiveTextEditorListener: Disposable;
    onDidChangeTextEditorSelectionListener: Disposable;
    onDidChangeTextEditorVisibleRangesListener: Disposable;

    initialFrame: Array<CodioFile> = [];
    codioEditors: Array<any>;
    records: Array<any> = [];

    record() {
        const editor = window.activeTextEditor;
        if (editor) {
            this.addCodioFileToInitialFrame(new ShadowDocument(editor.document.getText()), 1, editor.document.uri, 0);
            this.codioEditors = [editor.document.uri.path];
            this.onDidChangeActiveTextEditorListener = window.onDidChangeActiveTextEditor(this.onDidChangeActiveTextEditor);
            this.onDidChangeTextEditorSelectionListener = window.onDidChangeTextEditorSelection(this.onDidChangeTextEditorSelection);
            this.onDocumentTextChangedListener = workspace.onDidChangeTextDocument(this.onDocumentTextChanged);
            this.onDidChangeTextEditorVisibleRangesListener = window.onDidChangeTextEditorVisibleRanges(this.onDidChangeTextEditorVisibleRanges);
        } else {
            //@TODO: Handle codio that is recorded without an editor open initialy.
        }
    }

    addCodioFileToInitialFrame(document: ShadowDocument, column: number, uri: Uri, lastAction: number) {
        this.initialFrame.push({
            document,
            column,
            uri,
            lastAction,
        });
    }

    stopRecording() {
        this.onDidChangeActiveTextEditorListener.dispose();
        this.onDidChangeTextEditorSelectionListener.dispose();
        this.onDocumentTextChangedListener.dispose();
    }

    getTimelineContent(recordingStartTime, workspaceRoot?: Uri) {
        const {files, rootPath} = FSManager.normalizeFilesPath(this.codioEditors, workspaceRoot);
        const events = serializeEvents(this.records, rootPath);
        const initialFrame = serializeFrame(this.initialFrame, rootPath);
        const eventsTimeline = createRelativeTimeline(events, recordingStartTime);
        // change ctions to events, change codioEditors initialFilePath and initialContent to initialFrame.
        return {events: eventsTimeline, initialFrame, codioEditors: files};
    }

    onDocumentTextChanged = (e: TextDocumentChangeEvent) => {
        const record = eventCreators.createCodioTextEvent(e);
        if (record) {
            this.records.push(record);
        }
    }

    onDidChangeActiveTextEditor = (e: TextEditor) => {
        try {
            const editorPath = e.document.uri.path;
            const editorContent = e.document.getText();
            if (this.codioEditors.indexOf(editorPath) === -1) {
                this.codioEditors.push(editorPath);
                const record = eventCreators.createCodioEditorEvent(e, editorContent, true);
                this.records.push(record);
                this.addCodioFileToInitialFrame(new ShadowDocument(record.data.content), record.data.viewColumn, record.data.uri, 1);
            } else {
                const record = eventCreators.createCodioEditorEvent(e, editorContent, false);
                this.records.push(record);
            }
        } catch(e) {
            console.log('onDidChangeActiveTextEditor fail', e);
        }
    }

    onDidChangeTextEditorVisibleRanges = (e: TextEditorVisibleRangesChangeEvent) => {
        const record = eventCreators.createCodioVisibleRangeEvent(e);
        if (record) {
            this.records.push(record);
        }
    }

    onDidChangeTextEditorSelection = (e: TextEditorSelectionChangeEvent) => {
        const record = eventCreators.createCodioSelectionEvent(e);
        if (record) {
            this.records.push(record);
        }
    }

    executeFile = () => {
        const document = window.activeTextEditor.document;
        const outputChannel = window.createOutputChannel('codio');
        let output = "";
        const uri = document.uri;
        document.save().then(() => {
            outputChannel.show(true);
            exec(`node ${uri.fsPath}`, (err, stdout, stderr) => {
                if (stderr) {
                    output = stderr;
                    outputChannel.append(stderr);
                }
                if (stdout) {
                    outputChannel.append(stdout);
                    output = stdout;
                }
                if (output) {
                    const record = eventCreators.createCodioExecutionEvent(output);
                    this.records.push(record);
                }
            });
        });
    }
}