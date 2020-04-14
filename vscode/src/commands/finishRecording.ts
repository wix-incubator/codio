import {UI, MESSAGES} from '../user_interface/messages';

export default function finishRecording(recorder) {
    try {
        if (recorder && recorder.isRecording) {
            recorder.stopRecording();
            UI.showMessage(MESSAGES.savingRecording);
            recorder.saveRecording();
            UI.showMessage(MESSAGES.recordingSaved);
        }
    } catch(e) {
        console.log('finish recording failed', e);
    }
}