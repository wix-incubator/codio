import { workspace, Uri } from 'vscode';
import { showCodioNameInputBox, UI, MESSAGES } from '../user_interface/messages';
import { join } from 'path';
import { ensureDir } from './saveProjectFiles';
import { existsSync } from 'fs';

const createWorkspaceCodiosFolder = async (workspaceUri: Uri) => {
  const codioWorkspaceFolder = join(workspaceUri.fsPath, '.codio');
  await ensureDir(codioWorkspaceFolder);
  return codioWorkspaceFolder;
};

export const getWorkspaceUriAndCodioDestinationUri = async () => {
  let workspaceUri = null;
  let codioUri = null;
  let getCodioName = null;

  if (workspace.workspaceFolders) {
    const name = await showCodioNameInputBox();
    if (name) {
      workspaceUri = workspace.workspaceFolders[0].uri;
      const codioWorkspaceFolderPath = await createWorkspaceCodiosFolder(workspaceUri);
      codioUri = Uri.file(join(codioWorkspaceFolderPath, `${name.split(' ').join('_')}.codio`));
      getCodioName = async () => name;
    }
  } else {
    UI.showMessage(MESSAGES.noActiveWorkspace);
  }

  return { workspaceUri, codioUri, getCodioName };
};

export const getWorkspaceRootAndCodiosFolderIfExists = ():
  | { workspaceRootUri: Uri; workspaceCodiosFolder: string }
  | undefined => {
  const workspaceRootUri = workspace.workspaceFolders && workspace.workspaceFolders[0].uri;
  if (workspaceRootUri) {
    const workspaceCodiosFolder = join(workspaceRootUri.fsPath, '.codio');
    if (existsSync(workspaceCodiosFolder)) {
      return { workspaceCodiosFolder, workspaceRootUri };
    }
  }
};
