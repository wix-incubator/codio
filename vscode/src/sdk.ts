import * as codioCommands from './commands/index';
import Player from './player/Player';
import Recorder from './recorder/Recorder';
import FSManager from './filesystem/FSManager';
import { Uri } from 'vscode';

export function createSdk(player: Player, recorder: Recorder, fsManager: FSManager) {
  const recordCodio = (destination: Uri, workspaceRoot?: Uri, getCodioName?: () => Promise<string>) => {
    if (!destination) {
      throw new Error('recordCodio: destination is required when using codio is a package.');
    }
    codioCommands.recordCodio(fsManager, player, recorder, destination, workspaceRoot, getCodioName);
  };

  const playCodio = (source: Uri, workspaceUri?: Uri) => {
    if (!source) {
      throw new Error('playCodio: source is required when using codio is a package.');
    }
    codioCommands.playCodio(fsManager, player, recorder, source, workspaceUri);
  };

  const playCodioTask = async (source: Uri, workspaceUri?: Uri) => {
    codioCommands.playCodioTask(fsManager, player, recorder, source, workspaceUri);
  };

  const finishRecording = () => codioCommands.finishRecording(recorder);
  const pauseCodio = () => codioCommands.pauseCodio(player);
  const pauseOrResume = () => codioCommands.pauseOrResume(player);
  const resumeCodio = () => codioCommands.resumeCodio(player);
  const playFrom = (time) => codioCommands.playFrom(player, time);
  const rewind = (time) => codioCommands.rewind(player, time);
  const forward = (time) => codioCommands.forward(player, time);

  return {
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
}
