import {commands, ExtensionContext} from 'vscode';

import Player from './player/Player';
import Recorder from './recorder/Recorder';
import {registerTreeViews} from './user_interface/Viewers';
import FSManager from './filesystem/FSManager';
import * as COMMAND_NAMES from './consts/command_names';
import {
    finishRecording,
    pauseTutorial,
    pauseOrResume,
    resumeTutorial,
    playFrom,
    rewind,
    forward,
    executeFile,
    playCodio,
    recordCodio,
    createTutorial,
    addCodioToTutorial } from './commands/index';

export async function activate(context: ExtensionContext) {
    const fsManager = new FSManager();

    const player =  new Player();
    const recorder = new Recorder();

    registerTreeViews(fsManager);
    await fsManager.createExtensionFolders();

    const recordCodioDisposable = commands.registerCommand(COMMAND_NAMES.RECORD_CODIO, async () => {
        recordCodio(fsManager, player, recorder);
    });

    const finishRecordingDisposable = commands.registerCommand(COMMAND_NAMES.FINISH_RECORDING, () => {
        finishRecording(recorder);
    });

    const playCodioDisposable = commands.registerCommand(COMMAND_NAMES.PLAY_CODIO, async (path) => {
        playCodio(fsManager, player, recorder, path);
    });

    const pauseTutorialDisposable = commands.registerCommand(COMMAND_NAMES.PAUSE_TUTORIAL, () => {
        pauseTutorial(player);
    });

    const pauseOrResumeDisposable = commands.registerCommand(COMMAND_NAMES.PAUSE_OR_RESUME, () => {
        pauseOrResume(player);
    });

    const resumeTutorialDisposable = commands.registerCommand(COMMAND_NAMES.RESUME_TUTORIAL, () => {
        resumeTutorial(player);
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

    const createTutorialDisposable = commands.registerCommand(COMMAND_NAMES.CREATE_TUTORIAL, async () => {
        createTutorial(fsManager);
    });

    const addCodioToTutorialDisposable = commands.registerCommand(COMMAND_NAMES.ADD_CODIO_TO_TUTORIAL, async () => {
        addCodioToTutorial(fsManager);
     });


    context.subscriptions.push(recordCodioDisposable);
    context.subscriptions.push(finishRecordingDisposable);
    context.subscriptions.push(playCodioDisposable);
    context.subscriptions.push(pauseTutorialDisposable);
    context.subscriptions.push(resumeTutorialDisposable);
    context.subscriptions.push(playFromDisposable);
    context.subscriptions.push(createTutorialDisposable);
    context.subscriptions.push(executeFileDisposabble);
    context.subscriptions.push(rewindDisposable);
    context.subscriptions.push(forwardDisposable);
    context.subscriptions.push(pauseOrResumeDisposable);
    context.subscriptions.push(addCodioToTutorialDisposable);
}
export function deactivate() {
    //@TODO
}