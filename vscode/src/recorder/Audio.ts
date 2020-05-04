import { ChildProcess, exec, spawn, spawnSync} from "child_process";
import { isWindows, isMacOs } from "../utils/utils";
import {getDeviceList} from "../utils/ffmpegDeviceListParser";
export default class AudioRecorder {
    private audioFilePath: string;
    private currentAudioProcess: ChildProcess;
    private audioInputDevice: string = undefined;

    constructor(path: string) {
        this.audioFilePath = path;
        this.setDevice();
    }

    async setDevice() : Promise<boolean> {
        if (isWindows || isMacOs) {
            const deviceList: any = await getDeviceList();
            this.audioInputDevice = deviceList?.audioDevices[0].name;
            if (!this.audioInputDevice) {
                return false;
            } else {
                return true;
            }
        }
    }

    async record() {
        if (isWindows) {
            this.currentAudioProcess = exec(`ffmpeg -f dshow -i audio="${this.audioInputDevice}"  ${this.audioFilePath}`);
        } else {
            this.currentAudioProcess = exec(`ffmpeg -f avfoundation -i :"${this.audioInputDevice}" ${this.audioFilePath}`);
        }
    }

    async stopRecording() {
        if (isWindows) {
            return new Promise((res, rej) => {
                const taskKill = spawn("taskkill", ["/pid", this.currentAudioProcess.pid.toString(), '/f', '/t']);
                taskKill.stdout.on('data', () => res());
                taskKill.stderr.on('data', data => rej(data));
                taskKill.on('close', () => res());
            });
        } else {
            this.currentAudioProcess.kill();
        }
    }
}