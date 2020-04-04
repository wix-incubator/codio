import {showMessage,  MESSAGES} from '../user_interface/messages';
import {showPlayerProgressBar} from '../user_interface/Viewers';
import Player from '../player/Player';
import Recorder from '../recorder/Recorder';
import FSManager from '../filesystem/FSManager';
import { Uri } from 'vscode';

export default async function playCodio(fsManager: FSManager, player: Player, recorder: Recorder, codioUri? : Uri) {
  try {
    if (recorder && recorder.isRecording) {
      showMessage(MESSAGES.cantPlayWhileRecording);
      return;
    }
    if (player && player.isPlaying) {
      showMessage(MESSAGES.stopCodio);
      player.pause();
      player.closeCodio();
    }
    if (codioUri) {
      const codioUnzippedFolder = await fsManager.getCodioUnzipped(codioUri);
      await loadAndPlay(player, codioUnzippedFolder);
    } else {
      const codioId = await fsManager.chooseCodio();
      if (codioId) {
        const codioPath = fsManager.codioPath(codioId);
        //@TODO: add an if to check that the folder contains audio.mp3 and actions.json
        await loadAndPlay(player, codioPath);
      }
    }
  } catch (e) {
    console.log("Play codio failed", e);
  }
}

async function loadAndPlay(player: Player, path) {
  showMessage(MESSAGES.codioStart);
  await player.loadCodio(path);
  await player.startCodio();
  showPlayerProgressBar(player, false);

}