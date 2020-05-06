import * as vscode from 'vscode';
import FSManager from '../filesystem/FSManager';
import {PLAY_CODIO, RECORD_CODIO_AND_ADD_TO_PROJECT} from '../consts/command_names';
import { join } from 'path';

export async function registerTreeViews(fsManager: FSManager, extensionPath: string) {
    const codioTreeDataProvider = new CodiosDataProvider(fsManager, extensionPath);
    vscode.window.createTreeView("codioMessages", {treeDataProvider: codioTreeDataProvider});
    fsManager.onCodiosChanged(() => codioTreeDataProvider.refresh());
    vscode.workspace.onDidChangeWorkspaceFolders(() => codioTreeDataProvider.refresh());
}

export class CodiosDataProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
    codios: Array<any>;
    fsManager: FSManager;
    private extensionPath: string;

    _onDidChangeTreeData: vscode.EventEmitter<vscode.TreeItem | undefined> = new vscode.EventEmitter<vscode.TreeItem | undefined>();
    onDidChangeTreeData: vscode.Event<vscode.TreeItem | undefined> = this._onDidChangeTreeData.event;

    refresh(): void {
		this._onDidChangeTreeData.fire(undefined);
    }

    constructor(fsManager, extensionPath) {
        this.fsManager = fsManager;
        this.extensionPath = extensionPath;
    }

    getTreeItem(element) : vscode.TreeItem {
        return element;
    }

    async getChildren(element?: vscode.TreeItem): Promise<vscode.TreeItem[]>  {
        if (element) {
            return [element];
        } else {
           const allCodios = await this.fsManager.getAllCodiosMetadata();
           if (allCodios.length > 0) {
               return allCodios.map(codio => {
                   const codioItem = new vscode.TreeItem(codio.name);
                   codioItem.iconPath = {dark: join(this.extensionPath, "media/icon-small.svg"), light: join(this.extensionPath, "media/icon-small-light")};
                   codioItem.command =  {command: PLAY_CODIO, title: "Play Codio", arguments: [codio.uri, codio.workspaceRoot]};
                   codioItem.contextValue = "codio";
                   return codioItem;
               });
           } else {
            const recordCodioItem = new vscode.TreeItem("Record Codio");
            recordCodioItem.iconPath = {dark: join(this.extensionPath, "media/microphone.svg"), light: join(this.extensionPath, "media/microphone-light")};
            recordCodioItem.command =  {command: RECORD_CODIO_AND_ADD_TO_PROJECT, title: "Record Codio and Add to Project", arguments: []};
            recordCodioItem.contextValue = "codio";
            return [recordCodioItem];
           }
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
