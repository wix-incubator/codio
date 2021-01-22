import {
  UI,
  MESSAGES,
  showChooseAudioDevice,
} from "../user_interface/messages";
import Recorder from "../recorder/Recorder";
import Player from "../player/Player";
import FSManager from "../filesystem/FSManager";
import { Uri } from "vscode";
import { checkForFfmpeg } from "../utils";

export default async function recordCodio(
  fsManager: FSManager,
  player: Player,
  recorder: Recorder,
  destUri?: Uri,
  workspaceRoot?: Uri,
  getCodioName?: () => Promise<string>,
) {
  const hasFfmpeg = await checkForFfmpeg();
  if (!hasFfmpeg) {
    UI.showMessage(MESSAGES.ffmpegNotAvailable);
    return;
  }

  if (player.isPlaying) {
    player.closeCodio();
  }

  let codioName = '';
  if (getCodioName) {
    codioName = await getCodioName();
  }

  codioName = codioName?.trim();
  if (!codioName) {
    return;
  }

  const uuid = require('uuid');
  const codioId = uuid.v4();
  const path = await fsManager.createTempCodioFolder(codioId);
  await recorder.loadCodio(path, codioName, destUri, workspaceRoot);
  const isDeviceAvailable = await recorder.setRecordingDevice(showChooseAudioDevice);
  if (!isDeviceAvailable) {
    UI.showMessage(MESSAGES.noRecordingDeviceAvailable);
    return;
  }

  UI.showMessage(MESSAGES.startingToRecord);
  recorder.startRecording();
  UI.showRecorderProgressBar(recorder);
}
