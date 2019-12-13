import { ChildProcess, exec} from "child_process";

export default class AudioPlayer {
    private audioFilePath;
    private currentAudioProcess: ChildProcess;

    constructor(path: string) {
        this.audioFilePath = path;
    }

    play(time) {
        this.currentAudioProcess = exec(`ffplay -nodisp -ss ${time} ${this.audioFilePath}`);
    }

    pause() {
        this.currentAudioProcess.kill();
    }
}