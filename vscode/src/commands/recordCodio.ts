import {showMessage, MESSAGES, showCodioNameInputBox} from '../user_interface/messages';
import Recorder from '../recorder/Recorder';
import Player from '../player/Player';
import FSManager from '../filesystem/FSManager';
import { showRecorderProgressBar } from '../user_interface/Viewers';

export default async function recordCodio(fsManager: FSManager, player: Player, recorder: Recorder) {
    if (player.isPlaying) {
        player.closeTutorial();
    }
    const codioName = await showCodioNameInputBox();
    if (codioName) {
        const uuid = require("uuid");
        const codioId = uuid.v4();
        const path = await fsManager.createCodioFolder(codioId);
        recorder.loadCodio(path, codioName);
        showMessage(MESSAGES.startingToRecord);
        recorder.startRecording();
        showRecorderProgressBar(recorder, false);

    }
}