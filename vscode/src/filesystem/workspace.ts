import { workspace, Uri } from "vscode";
import { showCodioNameInputBox, UI, MESSAGES } from "../user_interface/messages";
import { join } from "path";
import {ensureDir} from './saveProjectFiles';
import { existsSync } from "fs";

const createWorkspaceCodiosFolder = async (workspaceUri: Uri) => {
    const codioWorkspaceFolder = join(workspaceUri.fsPath, '.codio');
    await ensureDir(codioWorkspaceFolder);
    return codioWorkspaceFolder;
};

export const getWorkspaceUriAndCodioDestinationUri = async () => {
	if (workspace.workspaceFolders) {
        const workspaceUri = workspace.workspaceFolders[0].uri;
        const codioWorkspaceFolderPath = await createWorkspaceCodiosFolder(workspaceUri);
        const name = await showCodioNameInputBox();
        if (name) {
         const codioUri = Uri.file(join(codioWorkspaceFolderPath, `${name}.codio`));
         return {workspaceUri, codioUri, getCodioName: async () => name};
        }
	} else {
        UI.showMessage(MESSAGES.noActiveWorkspace);
    }
};


export const getWorkspaceCodiosFolderIfExists = () : string | undefined => {
    const workspaceUri = workspace.workspaceFolders && workspace.workspaceFolders[0].uri;
    if (workspaceUri) {
        const codiosFolderPath = join(workspaceUri.fsPath, '.codio');
        if (existsSync(codiosFolderPath)) {
            return codiosFolderPath;
        }
    }
};