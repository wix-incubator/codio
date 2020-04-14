import {
  UI,
  MESSAGES,
} from "../user_interface/messages";
import Recorder from "../recorder/Recorder";
import Player from "../player/Player";
import FSManager from "../filesystem/FSManager";
import { Uri } from "vscode";
import { isWindows, checkForFfmpeg } from "../utils";

export default async function recordCodio(
  fsManager: FSManager,
  player: Player,
  recorder: Recorder,
  destUri?: Uri,
  workspaceRoot?: Uri,
  getCodioName?: () => Promise<string>
) {
  if (isWindows) {
    UI.showMessage(MESSAGES.windowsNotSupported);
  } else {
    const hasFfmpeg = await checkForFfmpeg();
    if (!hasFfmpeg) {
      UI.showMessage(MESSAGES.ffmpegNotAvailable);
    } else {
      if (player.isPlaying) {
        player.closeCodio();
      }
      let codioName = '';
      if (getCodioName) {
        codioName = await getCodioName();
      }
      const uuid = require("uuid");
      const codioId = uuid.v4();
      const path = await fsManager.createTempCodioFolder(codioId);
      recorder.loadCodio(path, codioName, destUri, workspaceRoot);
      UI.showMessage(MESSAGES.startingToRecord);
      recorder.startRecording();
      UI.showRecorderProgressBar(recorder);
    }
  }
}
