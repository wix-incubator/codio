import { ChildProcess, exec} from "child_process";

export default class AudioRecorder {
    private audioFilePath;
    private currentAudioProcess: ChildProcess;
    private audioInputDevice: string = ":0";

    constructor(path: string) {
        this.audioFilePath = path;
    }

    record() {
        this.currentAudioProcess = exec(`ffmpeg -f avfoundation -i "${this.audioInputDevice}"  ${this.audioFilePath}`);
    }

    stopRecording() {
        this.currentAudioProcess.kill();
    }
}