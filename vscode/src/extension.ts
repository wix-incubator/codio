import {commands, ExtensionContext, Uri} from 'vscode';

import Player from './player/Player';
import Recorder from './recorder/Recorder';
import {registerTreeViews} from './user_interface/Viewers';
import FSManager from './filesystem/FSManager';
import * as COMMAND_NAMES from './consts/command_names';
import {
    finishRecording,
    pauseCodio,
    pauseOrResume,
    resumeCodio,
    playFrom,
    rewind,
    forward,
    executeFile,
    playCodio,
    recordCodio,
    } from './commands/index';

export async function activate(context: ExtensionContext) {
    const fsManager = new FSManager();

    const player =  new Player();
    const recorder = new Recorder();
    registerTreeViews(fsManager);
    await fsManager.createExtensionFolders();

    const recordCodioDisposable = commands.registerCommand(COMMAND_NAMES.RECORD_CODIO, async (uri: Uri, workspaceRoot: Uri) => {
        recordCodio(fsManager, player, recorder, uri, workspaceRoot);
    });

    const finishRecordingDisposable = commands.registerCommand(COMMAND_NAMES.FINISH_RECORDING, () => {
        finishRecording(recorder);
    });

    const playCodioDisposable = commands.registerCommand(COMMAND_NAMES.PLAY_CODIO, async (uri: Uri, workspaceUri: Uri) => {
        playCodio(fsManager, player, recorder, uri, workspaceUri);
    });

    const pauseCodioDisposable = commands.registerCommand(COMMAND_NAMES.PAUSE_CODIO, () => {
        pauseCodio(player);
    });

    const pauseOrResumeDisposable = commands.registerCommand(COMMAND_NAMES.PAUSE_OR_RESUME, () => {
        pauseOrResume(player);
    });

    const resumeCodioDisposable = commands.registerCommand(COMMAND_NAMES.RESUME_CODIO, () => {
        resumeCodio(player);
    });

    const playFromDisposable = commands.registerCommand(COMMAND_NAMES.PLAY_FROM, async (time?: number) => {
        playFrom(player, time);
    });

    const rewindDisposable = commands.registerCommand(COMMAND_NAMES.REWIND, async (time?: number) => {
        rewind(player, time);
    });

    const forwardDisposable = commands.registerCommand(COMMAND_NAMES.FORWARD, async (time?: number) => {
        forward(player, time);
    });

    const executeFileDisposabble = commands.registerCommand(COMMAND_NAMES.EXECUTE_FILE, async () => {
        executeFile(recorder);
    });

    context.subscriptions.push(recordCodioDisposable);
    context.subscriptions.push(finishRecordingDisposable);
    context.subscriptions.push(playCodioDisposable);
    context.subscriptions.push(pauseCodioDisposable);
    context.subscriptions.push(resumeCodioDisposable);
    context.subscriptions.push(playFromDisposable);
    context.subscriptions.push(executeFileDisposabble);
    context.subscriptions.push(rewindDisposable);
    context.subscriptions.push(forwardDisposable);
    context.subscriptions.push(pauseOrResumeDisposable);
}

export function deactivate() {
    //@TODO: kill any active FFMPEG proccess
}