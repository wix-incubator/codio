import { commands, ExtensionContext, Uri } from 'vscode';
import { UI, showCodioNameInputBox } from './user_interface/messages';
import Player from './player/Player';
import Recorder from './recorder/Recorder';
import { registerTreeViews } from './user_interface/Viewers';
import FSManager from './filesystem/FSManager';
import * as COMMAND_NAMES from './consts/command_names';
import * as codioCommands from './commands/index';
import { createSdk } from './sdk';
import { getWorkspaceUriAndCodioDestinationUri, CODIO_FOLDER, LIBRARY_FOLDER } from './filesystem/workspace';

const fsManager = new FSManager();
const player = new Player();
const recorder = new Recorder();

const {
  recordCodio,
  finishRecording,
  playCodio,
  playCodioTask,
  pauseCodio,
  pauseOrResume,
  resumeCodio,
  playFrom,
  rewind,
  forward,
} = createSdk(player, recorder, fsManager);

export {
  recordCodio,
  finishRecording,
  playCodio,
  playCodioTask,
  pauseCodio,
  pauseOrResume,
  resumeCodio,
  playFrom,
  rewind,
  forward,
};

export async function activate(context: ExtensionContext) {
  await fsManager.createExtensionFolders();
  UI.shouldDisplayMessages = true;
  registerTreeViews(fsManager, context.extensionPath);

  const recordCodioDisposable = commands.registerCommand(
    COMMAND_NAMES.RECORD_CODIO,
    async () => {
      const { workspaceUri, codioUri, getCodioName } = await getWorkspaceUriAndCodioDestinationUri(CODIO_FOLDER)
      if (workspaceUri && codioUri && getCodioName) {
        codioCommands.recordCodio(fsManager, player, recorder, codioUri, workspaceUri, getCodioName);
      }
    },
  );

  const recordCodioAndAddToProjectDisposable = commands.registerCommand(
    COMMAND_NAMES.RECORD_CODIO_AND_ADD_TO_PROJECT,
    async () => {
      const { workspaceUri, codioUri, getCodioName } = await getWorkspaceUriAndCodioDestinationUri(CODIO_FOLDER);
      if (workspaceUri && codioUri && getCodioName) {
        codioCommands.recordCodio(fsManager, player, recorder, codioUri, workspaceUri, getCodioName);
      }
    },
  );

  const finishRecordingDisposable = commands.registerCommand(COMMAND_NAMES.FINISH_RECORDING, () => {
    codioCommands.finishRecording(recorder);
  });

  const playCodioDisposable = commands.registerCommand(
    COMMAND_NAMES.PLAY_CODIO,
    async (source: Uri, workspaceUri?: Uri) => {
      codioCommands.playCodio(fsManager, player, recorder, source, workspaceUri);
    },
  );

  const playCodioTaskDisposable = commands.registerCommand(
    COMMAND_NAMES.PLAY_CODIO_TASK,
    async (source: Uri, workspaceUri?: Uri) => {
      codioCommands.playCodioTask(fsManager, player, recorder, source, workspaceUri);
    },
  );

  const pauseCodioDisposable = commands.registerCommand(COMMAND_NAMES.PAUSE_CODIO, () => {
    codioCommands.pauseCodio(player);
  });

  const pauseOrResumeDisposable = commands.registerCommand(COMMAND_NAMES.PAUSE_OR_RESUME, () => {
    codioCommands.pauseOrResume(player);
  });

  const resumeCodioDisposable = commands.registerCommand(COMMAND_NAMES.RESUME_CODIO, () => {
    codioCommands.resumeCodio(player);
  });

  const playFromDisposable = commands.registerCommand(COMMAND_NAMES.PLAY_FROM, async (time?: number) => {
    codioCommands.playFrom(player, time);
  });

  const rewindDisposable = commands.registerCommand(COMMAND_NAMES.REWIND, async (time?: number) => {
    codioCommands.rewind(player, time);
  });

  const forwardDisposable = commands.registerCommand(COMMAND_NAMES.FORWARD, async (time?: number) => {
    codioCommands.forward(player, time);
  });

  const executeFileDisposabble = commands.registerCommand(COMMAND_NAMES.EXECUTE_FILE, async () => {
    codioCommands.executeFile(recorder);
  });

  context.subscriptions.push(recordCodioDisposable);
  context.subscriptions.push(recordCodioAndAddToProjectDisposable);
  context.subscriptions.push(finishRecordingDisposable);
  context.subscriptions.push(playCodioDisposable);
  context.subscriptions.push(playCodioTaskDisposable);
  context.subscriptions.push(pauseCodioDisposable);
  context.subscriptions.push(resumeCodioDisposable);
  context.subscriptions.push(playFromDisposable);
  context.subscriptions.push(executeFileDisposabble);
  context.subscriptions.push(rewindDisposable);
  context.subscriptions.push(forwardDisposable);
  context.subscriptions.push(pauseOrResumeDisposable);
}

export function deactivate() {
  player.closeCodio();
  recorder.stopRecording();
}
