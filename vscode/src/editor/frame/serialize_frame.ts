import FSManager from '../../filesystem/FSManager';


export default function serializeFrame(frame : Array<CodioFile>, rootPath: string) : Array<CodioSerializedFile>{
    return frame.map(file => {
        return serializeFile(file, rootPath);
    }).filter(event => !!event);
}

function serializeFile(file: CodioFile, rootPath) : CodioSerializedFile {
    return {
        column: file.column,
        lastActionCount: file.lastAction,
        path: FSManager.codifyPath(file.uri, rootPath),
        text: file.document.text,
    };
}
