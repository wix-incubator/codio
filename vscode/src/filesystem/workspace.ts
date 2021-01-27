import { workspace, Uri } from 'vscode';
import { showCodioNameInputBox, UI, MESSAGES } from '../user_interface/messages';
import { join } from 'path';
import { ensureDir } from './saveProjectFiles';
import { existsSync } from 'fs';

export const CODIO_FOLDER = '.codio';
export const LIBRARY_FOLDER = '.codiolibrary';

const createWorkspaceCodiosFolder = async (workspaceUri: Uri, folder: string) => {
  const codioWorkspaceFolder = join(workspaceUri.fsPath, folder);
  await ensureDir(codioWorkspaceFolder);
  return codioWorkspaceFolder;
};

export const getWorkspaceUriAndCodioDestinationUri = async (folder: String) => {
  let workspaceUri = null;
  let codioUri = null;
  let getCodioName = null;

  if (workspace.workspaceFolders) {
    const name = await showCodioNameInputBox();
    if (name) {
      workspaceUri = workspace.workspaceFolders[0].uri;
      const codioWorkspaceFolderPath = await createWorkspaceCodiosFolder(workspaceUri, folder);
      codioUri = Uri.file(join(codioWorkspaceFolderPath, `${name.split(' ').join('_')}.codio`));
      getCodioName = async () => name;
    }
  } else {
    UI.showMessage(MESSAGES.noActiveWorkspace);
  }

  return { workspaceUri, codioUri, getCodioName };
};

export const getWorkspaceRootAndCodiosFolderIfExists = (folder: string):
  | { workspaceRootUri: Uri; workspaceCodiosFolder: string }
  | undefined => {
  const workspaceRootUri = workspace.workspaceFolders && workspace.workspaceFolders[0].uri;
  if (workspaceRootUri) {
    const workspaceCodiosFolder = join(workspaceRootUri.fsPath, folder);
    if (existsSync(workspaceCodiosFolder)) {
      return { workspaceCodiosFolder, workspaceRootUri };
    }
  }
};
