import {showMessage, MESSAGES, showCodioNameInputBox} from '../user_interface/messages';
import Recorder from '../recorder/Recorder';
import Player from '../player/Player';
import FSManager from '../filesystem/FSManager';
import { showRecorderProgressBar } from '../user_interface/Viewers';
import { Uri } from 'vscode';
import { isWindows, checkForFfmpeg } from '../utils';

export default async function recordCodio(fsManager: FSManager, player: Player, recorder: Recorder, destUri?: Uri, workspaceRoot?: Uri ) {
    if (isWindows) {
        showMessage(MESSAGES.windowsNotSupported);
    } else {
    const hasFfmpeg = await checkForFfmpeg();
    if (!hasFfmpeg) {
        showMessage(MESSAGES.ffmpegNotAvailable);
    } else {
        if (player.isPlaying) {
            player.closeCodio();
        }
    const codioName = await showCodioNameInputBox();
        if (codioName) {
            const uuid = require("uuid");
            const codioId = uuid.v4();
            const path = await fsManager.createTempCodioFolder(codioId);
            console.log({path});
            recorder.loadCodio(path, codioName, destUri, workspaceRoot);
            showMessage(MESSAGES.startingToRecord);
            recorder.startRecording();
            showRecorderProgressBar(recorder);
        }
    }
    }
}