import { Uri } from 'vscode';
import { UI, MESSAGES } from '../user_interface/messages';
import Player from '../player/Player';
import Recorder from '../recorder/Recorder';
import FSManager from '../filesystem/FSManager';
import { checkForFfmpeg, isTreeItem } from '../utils';

export default async function playCodio(
  fsManager: FSManager,
  player: Player,
  recorder: Recorder,
  codioUri?: Uri,
  workspaceUri?: Uri,
) {
  if (isTreeItem(codioUri)) {
    codioUri = codioUri['command']?.arguments[0];
  }

  try {
    const hasFfmpeg = await checkForFfmpeg();
    if (!hasFfmpeg) {
      UI.showMessage(MESSAGES.ffmpegNotAvailable);
    } else {
      const workspacePath = workspaceUri?.fsPath;
      if (recorder && recorder.isRecording) {
        UI.showMessage(MESSAGES.cantPlayWhileRecording);
        return;
      }
      if (player && player.isPlaying) {
        player.stop();
      }
      if (codioUri) {
        const codioUnzippedFolder = await fsManager.getCodioUnzipped(codioUri);
        await loadAndPlay(player, codioUnzippedFolder, workspacePath);
      } else {
        const itemSelected = await fsManager.chooseCodio();
        if (itemSelected?.path) {
          //@TODO: add an if to check that the folder contains audio.mp3 and actions.json
          await loadAndPlay(player, itemSelected.path, itemSelected.workspaceRoot?.fsPath);
        }
      }
    }
  } catch (e) {
    console.log('Play codio failed', e);
  }
}

async function loadAndPlay(player: Player, path, workspacePath) {
  await player.loadCodio(path, workspacePath);
  await player.startCodio();
  UI.showStatusBarProgress(player);
}
