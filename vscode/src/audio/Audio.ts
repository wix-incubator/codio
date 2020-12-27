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

  async setDevice(prompt: (items: string[]) => Promise<string | undefined>): Promise<boolean> {
    if (isWindows || isMacOs) {
      const deviceList: any = await getDeviceList();
      const audioDevices = deviceList?.audioDevices;
      if (audioDevices?.length) {
        if (audioDevices.length > 1) {
          const deviceName = await prompt(audioDevices.map((device) => device.name));
          if (deviceName) {
            this.audioInputDevice = deviceName;
          }
        } else {
          this.audioInputDevice = audioDevices[0].name;
        }
      }
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
    this.currentAudioProcess = exec(`ffplay -hide_banner -nodisp -nostats -autoexit -ss ${time} ${this.audioFilePath}`);
  }

  async pause() {
    return this.stopAudioProcess();
  }

  stopAudioProcess() {
    const proc = this.currentAudioProcess;
    if (isWindows) {
      if (this.isRecording()) {
        process.once('exit', this.taskKill);

        const p = new Promise<string | void>((res, rej) => {
          proc.once('exit', (code, signal) => {
            if (this.exitWin32Process(code, signal)) {
              res();
            } else {
              rej('stopAudioProcess exitWin32Process Error');
            }
          });
          proc.once('error', (err) => {
            process.removeListener('exit', this.taskKill);
            this.taskKill();
            rej(err.message);
          });
        });

        this.quitRecording();

        return p;
      }
    } else {
      proc.kill();
    }
  }

  isRecording() {
    return this.currentAudioProcess.stdin.writable;
  }

  quitRecording() {
    // ffmpeg CLI waits for 'q' input to exit if duration argument not given.
    this.currentAudioProcess.stdin.write('q');
  }

  exitWin32Process(code: number, signal: string) {
    process.removeListener('exit', this.taskKill);
    if (code || signal) {
      this.taskKill();
      return false;
    }
    return true;
  }

  taskKill() {
    spawn('taskkill', ['/pid', this.currentAudioProcess.pid.toString(), '/f', '/t']);
  }
}
