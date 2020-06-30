import { ChildProcess, exec, spawn } from 'child_process';
import { getDeviceList } from './ffmpegDeviceListParser';
import { isWindows, isMacOs } from '../utils';

export default class AudioHandler {
  private audioFilePath;
  private currentAudioProcess: ChildProcess;
  private audioInputDevice: string;

  constructor(path: string) {
    this.audioFilePath = path;
  }

  async setDevice(): Promise<boolean> {
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
    return this.stopAudioProcess();
  }

  play(time) {
    this.currentAudioProcess = exec(`ffplay -nodisp -ss ${time} ${this.audioFilePath}`);
  }

  async pause() {
    return this.stopAudioProcess();
  }

  stopAudioProcess() {
    if (isWindows) {
      return new Promise((res, rej) => {
        const taskKill = spawn('taskkill', ['/pid', this.currentAudioProcess.pid.toString(), '/f', '/t']);
        taskKill.stdout.on('data', () => res());
        taskKill.stderr.on('data', (data) => rej(data));
        taskKill.on('close', () => res());
      });
    } else {
      this.currentAudioProcess.kill();
    }
  }
}
