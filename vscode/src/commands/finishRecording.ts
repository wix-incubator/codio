import {showMessage, MESSAGES} from '../user_interface/messages'

export default function finishRecording(recorder) {
    console.log('hi');
    try {
        if (recorder && recorder.isRecording) {
            recorder.stopRecording();
            showMessage(MESSAGES.savingRecording);
            recorder.saveRecording();
            showMessage(MESSAGES.recordingSaved);
        }
    } catch(e) {
        console.log('finish recording failed', e)
    }
}