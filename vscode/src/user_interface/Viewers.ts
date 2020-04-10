import * as vscode from 'vscode';
import Player from '../player/Player';
import FSManager from '../filesystem/FSManager';
import {PLAY_CODIO, RECORD_MESSAGE} from '../consts/command_names';
import Recorder from '../recorder/Recorder';

export async function registerTreeViews(fsManager: FSManager) {
    const codioTreeDataProvider = new CodiosDataProvider(fsManager);
    vscode.window.createTreeView("codioMessages", {treeDataProvider: codioTreeDataProvider});
    fsManager.onCodiosChanged(() => codioTreeDataProvider.refresh());
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
