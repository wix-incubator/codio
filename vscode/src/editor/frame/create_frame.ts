import { Uri } from "vscode";
import ShadowDocument from "./ShadowDocument";
import { isTextEvent, isEditorEvent } from "../event_creator";

const INITIAL_FILE_INDEX = 0;

function initialFrametoDocumentsByPath(initialFrame: Array<CodioFile>) {
    return initialFrame.reduce((docByPath, file) => {
        docByPath[file.uri.path] = {
            document: new ShadowDocument(file.document.text),
            column: file.column,
            lastAction: file.lastAction
        };
        return docByPath;
    }, {});
}

function getInitialFileFromInitialFrame(initialFrame: CodioFrame) : CodioFile{
    return initialFrame[INITIAL_FILE_INDEX];
}
export function getInitialFilePathAndContentFromFrame(initialFrame: CodioFrame) {
    const {document, uri} = getInitialFileFromInitialFrame(initialFrame);
    return {content: document.text, uri};
}
export function createFrame(initialFrame: Array<CodioFile>, timeline: Array<CodioEvent>): CodioFrame {
    let actionCounter = 0;
    const documentsByPath = initialFrametoDocumentsByPath(initialFrame);

    timeline.forEach(event => {
        if (isTextEvent(event)) {
            const document: ShadowDocument = documentsByPath[event.data.uri.path].document;
            event.data.changes.forEach(change => {
                if (change.position) {
                    document.replaceWithPosition(change.position, change.value);
                } else if (change.range) {
                    document.replaceWithRange(change.range, change.value);
                }
            });
        } else if (isEditorEvent(event)) {
            const viewColumn = event.data.viewColumn || 1;
            if (event.data.isInitial) {
                documentsByPath[event.data.uri.path] = {
                    document: new ShadowDocument(event.data.content),
                    column: viewColumn,
                    lastAction: actionCounter
                };
            } else {
                if (documentsByPath[event.data.uri.path]) {
                    documentsByPath[event.data.uri.path].column = viewColumn;
                    documentsByPath[event.data.uri.path].lastAction = actionCounter;
                }
            }
        }
        actionCounter++;
    });
    // this should all go to utils - make an auto go to util command.
    const frame = Object.keys(documentsByPath).map(path => ({...documentsByPath[path], uri: Uri.file(path) }))
    .sort((a, b) => a.lastAction<b.lastAction ? -1 : a.lastAction>b.lastAction ? 1 : 0);
    console.log(frame);
    return frame;
}