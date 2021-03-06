import * as vscode from 'vscode';
import FSManager from '../filesystem/FSManager';
import { PLAY_CODIO, RECORD_CODIO_AND_ADD_TO_PROJECT } from '../consts/command_names';
import { join } from 'path';

export async function registerTreeViews(fsManager: FSManager, extensionPath: string) {
  const codioTreeDataProvider = new CodiosDataProvider(fsManager, extensionPath);
  vscode.window.createTreeView('codioMessages', { treeDataProvider: codioTreeDataProvider });
  fsManager.onCodiosChanged(() => codioTreeDataProvider.refresh());
  vscode.workspace.onDidChangeWorkspaceFolders(() => codioTreeDataProvider.refresh());
}

export class CodiosDataProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
  codios: Array<any>;
  fsManager: FSManager;
  private extensionPath: string;

  _onDidChangeTreeData: vscode.EventEmitter<vscode.TreeItem | undefined> = new vscode.EventEmitter<
    vscode.TreeItem | undefined
  >();
  onDidChangeTreeData: vscode.Event<vscode.TreeItem | undefined> = this._onDidChangeTreeData.event;

  refresh(): void {
    this._onDidChangeTreeData.fire(undefined);
  }

  constructor(fsManager, extensionPath) {
    this.fsManager = fsManager;
    this.extensionPath = extensionPath;
  }

  getTreeItem(element): vscode.TreeItem {
    return element;
  }

  async getChildren(element?: vscode.TreeItem): Promise<vscode.TreeItem[]> {
    const { workspaceCodios, libraryCodios } = await this.fsManager.getAllCodiosMetadata();
    const allCodios = [...workspaceCodios, ...libraryCodios];

    if (!allCodios.length) {
      return [new RecordActionItem(this.extensionPath)];
    }

    if (!element) {
      return [
        new vscode.TreeItem('Workspace Codios', vscode.TreeItemCollapsibleState.Collapsed),
        new vscode.TreeItem('Library Codios', vscode.TreeItemCollapsibleState.Collapsed),
      ];
    }

    if (element.label === 'Workspace Codios') {
      return workspaceCodios.map((codio) => new CodioItem(codio, this.extensionPath));
    }

    if (element.label === 'Library Codios') {
      return libraryCodios.map((codio) => new CodioItem(codio, this.extensionPath));
    }
  }
}

class RecordActionItem extends vscode.TreeItem {
  constructor(extensionPath: string) {
    super('Record Codio');
    this.iconPath = {
      dark: join(extensionPath, 'media/microphone.svg'),
      light: join(extensionPath, 'media/microphone-light.svg'),
    };
    this.command = {
      command: RECORD_CODIO_AND_ADD_TO_PROJECT,
      title: 'Record Codio and Add to Project',
      arguments: [],
    };
    this.contextValue = 'codio';
  } 
}

class CodioItem extends vscode.TreeItem {
  constructor(codio: { name: string; uri: string; workspaceRoot: string }, extensionPath: string) {
    super(codio.name);
    this.iconPath = {
      dark: join(extensionPath, 'media/icon-small.svg'),
      light: join(extensionPath, 'media/icon-small-light.svg'),
    };
    this.command = { command: PLAY_CODIO, title: 'Play Codio', arguments: [codio.uri, codio.workspaceRoot] };
    this.contextValue = 'codio';
  }
}

export const cursorStyle = vscode.window.createTextEditorDecorationType({
  dark: {
    backgroundColor: vscode.workspace.getConfiguration('codio').get<string>('cursorColorDarkTheme'),
  },
  light: {
    backgroundColor: vscode.workspace.getConfiguration('codio').get<string>('cursorColorLightTheme'),
  },
  borderStyle: 'solid',
  borderWidth: '1px',
});
