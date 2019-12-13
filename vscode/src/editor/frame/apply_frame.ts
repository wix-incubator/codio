import { asyncForEach, overrideEditorText } from "../../utils";
import { TextEditor, window, commands } from "vscode";

export async function applyFrame(frame: CodioFrame) {
    await asyncForEach(frame, async file => {
        const textEditor: TextEditor = window.visibleTextEditors.find(editor => editor.document.uri.path === file.uri.path);
        if (textEditor && textEditor.viewColumn !== file.column) {
            await window.showTextDocument(textEditor.document, {viewColumn: textEditor.viewColumn});
            await commands.executeCommand('workbench.action.closeActiveEditor');
        }
        const editor = await window.showTextDocument(file.uri, {viewColumn: file.column, preview: false});
        console.log({text: file.document.text, editorPath: editor.document.uri.path, originPath: file.uri});
        await overrideEditorText(editor, file.document.text);
    });
}