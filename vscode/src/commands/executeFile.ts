import { interacterExecute } from "../editor/execution";

export default function executeFile(recorder) {
    if (recorder && recorder.isRecording) {
        recorder.executeFile();
    } else {
        interacterExecute();
    }
}