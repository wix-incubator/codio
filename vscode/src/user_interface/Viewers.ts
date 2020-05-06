import * as vscode from 'vscode';
import FSManager from '../filesystem/FSManager';
import {PLAY_CODIO} from '../consts/command_names';
import { getWorkspaceCodiosFolderIfExists } from '../filesystem/workspace';

export async function registerTreeViews(fsManager: FSManager) {
    const codioTreeDataProvider = new CodiosDataProvider(fsManager);
    vscode.window.createTreeView("codioMessages", {treeDataProvider: codioTreeDataProvider});
    fsManager.onCodiosChanged(() => codioTreeDataProvider.refresh());
    vscode.workspace.onDidChangeWorkspaceFolders(() => codioTreeDataProvider.refresh());
}

export class CodiosDataProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
    codios: Array<any>;
    fsManager: FSManager;

    _onDidChangeTreeData: vscode.EventEmitter<vscode.TreeItem | undefined> = new vscode.EventEmitter<vscode.TreeItem | undefined>();
    onDidChangeTreeData: vscode.Event<vscode.TreeItem | undefined> = this._onDidChangeTreeData.event;

    refresh(): void {
		this._onDidChangeTreeData.fire(undefined);
    }

    constructor(fsManager) {
        this.fsManager = fsManager;
    }

    getTreeItem(element) : vscode.TreeItem {
        return element;
    }

    async getChildren(element?: vscode.TreeItem): Promise<vscode.TreeItem[]>  {
        if (element) {
            return [element];
        } else {
           const allCodios = await this.fsManager.getAllCodiosMetadata();
            return allCodios.map(codio => {
                const codioItem = new vscode.TreeItem(codio.name);
                codioItem.command =  {command: PLAY_CODIO, title: "Play Codio", arguments: [codio.uri]};
                codioItem.contextValue = "codio";
                return codioItem;
            });

        }
    }
}


export const cursorStyle = vscode.window.createTextEditorDecorationType({
    backgroundColor: new vscode.ThemeColor('editorCursor.foreground'),
    borderColor: new vscode.ThemeColor('editorCursor.foreground'),
    dark: {
      color: 'rgb(81,80,82)',
    },
    light: {
      // used for light colored themes
      color: 'rgb(255, 255, 255)',
    },
    borderStyle: 'solid',
    borderWidth: '1px',
  });
