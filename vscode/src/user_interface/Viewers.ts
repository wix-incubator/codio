import * as vscode from 'vscode';
import Player from '../player/Player';
import FSManager from '../filesystem/FSManager';
import {PLAY_CODIO, RECORD_MESSAGE} from '../consts/command_names';
import Recorder from '../recorder/Recorder';

export async function registerTreeViews(fsManager: FSManager) {
    const codioTreeDataProvider = new CodiosDataProvider(fsManager);
    const tutorialTreeDataProvider = new TutorialDataProvider(fsManager);
    vscode.window.createTreeView("codioMessages", {treeDataProvider: codioTreeDataProvider});
    vscode.window.createTreeView("codioTutorials", {treeDataProvider: tutorialTreeDataProvider});
    fsManager.onCodiosChanged(() => codioTreeDataProvider.refresh());
    fsManager.onCodiosChanged(() => tutorialTreeDataProvider.refresh());
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
            const codios = await this.fsManager.getCodiosMetadata();
            return codios.map(codio => {
                const codioItem = new vscode.TreeItem(codio.name);
                codioItem.command =  {command: PLAY_CODIO, title: "Play Codio", arguments: [vscode.Uri.file(this.fsManager.codioPath(codio.id))]};
                codioItem.contextValue = "codio";
                return codioItem;
            });

        }
    }
}

export class TutorialDataProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
    tutorialsMetaData = {};
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
            return this.tutorialsMetaData[element.id].codios.map(async codio => {
                const codioId = codio.id;
                const codioMetadata = await this.fsManager.getCodioMetaDataContent(codioId);
                const codioItem = new vscode.TreeItem(codioMetadata.name);
                codioItem.command =  {command: PLAY_CODIO, title: "Play Codio", arguments: [vscode.Uri.file(this.fsManager.codioPath(codioId))]};
                codioItem.contextValue = "codio";
                return codioItem;
            });
        } else {
            const tutorialsMetaData = await this.fsManager.getTutorialsMetadata();
            const items = tutorialsMetaData.map(tutorial => {
                this.tutorialsMetaData[tutorial.id] = tutorial;
                const tutorialItem = new vscode.TreeItem(tutorial.name);
                tutorialItem.id = tutorial.id;
                tutorialItem.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
                return tutorialItem;
            });
            return items;
        }
    }
}

export function showPlayerProgressBar(player: Player, isMessage) {
    vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "Playing Codio",
            cancellable: true
        }, async (progress, token) => {
            token.onCancellationRequested(() => {
                player.pause();
                player.closeCodio();
            });
            let lastPercentage = 0;
            player.onTimerUpdate(async (currentTime, totalTime) => {
                const percentage = ((currentTime * 100) / totalTime);
                if (percentage >= 100 && isMessage) {
                    const response = await vscode.window.showInformationMessage("Would you like to reply?", "No", "Yes");
                    if (response === "Yes") {
                        vscode.commands.executeCommand(RECORD_MESSAGE);
                    }
                }
                const increment = percentage - lastPercentage;
                progress.report({ increment, message: `${currentTime}/${totalTime}` });
                lastPercentage = percentage;
            });
            await player.process;
        });
}

export function showRecorderProgressBar(recorder: Recorder, isMessage) {
    vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: "Recording Codio",
        cancellable: true
        }, async (progress, token) => {
        token.onCancellationRequested(() => {
            recorder.stopRecording();
            recorder.saveRecording();
        });
        recorder.onTimerUpdate(async (currentTime) => {
            progress.report({message: `${currentTime}` });
        });
        await recorder.process;
    });
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
