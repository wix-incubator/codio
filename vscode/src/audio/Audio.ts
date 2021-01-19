import { ChildProcess, exec, spawn } from 'child_process';
import { getDeviceList } from './ffmpegDeviceListParser';
import { isWindows, isMacOs } from '../utils';

/**
 * Possible audio process states.
 */
enum State {
  NONE,
  PLAYING,
  RECORDING,
}

export default class AudioHandler {
  private audioFilePath;
  private currentAudioProcess: ChildProcess;
  private audioInputDevice: string;
  private state: State;

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
    this.state = State.RECORDING;
  }

  async stopRecording() {
    return this.stopAudioProcess();
  }

  /**
   * Play audio file with no visuals and exit when done.
   * @param time Time in seconds to seek into audio file.
   */
  play(time) {
    this.currentAudioProcess = exec(`ffplay -hide_banner -nodisp -nostats -autoexit -ss ${time} ${this.audioFilePath}`);
    this.state = State.PLAYING;
  }

  async pause() {
    return this.stopAudioProcess();
  }

  /**
   * Stop audio process in regards to OS.
   */
  private stopAudioProcess() {
    const proc = this.currentAudioProcess;
    if (isWindows) {
      if (this.isRecording()) {
        // Kill if VS Code process exits before audio process
        process.once('exit', this.taskKill);

        // Listen to process events and handle accordingly
        const p = new Promise<string | void>((res, rej) => {
          proc.once('exit', (code, signal) => {
            if (this.exitWin32Process(code, signal)) {
              this.clear();
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

      this.taskKill();
    } else {
      proc.kill();
      this.clear();
    }
  }

  /**
   * Check if the current process writeable.
   * @return True if writeable, false otherwise.
   */
  private isRecording(): boolean {
    return this.currentAudioProcess?.stdin.writable && this.state === State.RECORDING;
  }

  /**
   * Quit recording on ffmpeg by sending 'q' to the process input.
   * Only valid if duration argument not given when executed.
   */
  private quitRecording() {
    this.currentAudioProcess.stdin.write('q');
  }

  /**
   * Check if windows process exited cleanly.
   * @param code Exit code; 0 for no issues.
   * @param signal Signal code; null for no issues.
   * @return True on clean exit, false otherwise.
   */
  private exitWin32Process(code: number, signal: string) {
    process.removeListener('exit', this.taskKill);
    if (code || signal) {
      this.taskKill();
      return false;
    }
    return true;
  }

  /**
   * Windows specific way to kill a process when all else fails.
   * taskkill options:
   * '/pid' Process Id to kill.
   * '/f' Force.
   * '/t' Terminate any children.
   */
  private taskKill() {
    spawn('taskkill', ['/pid', this.currentAudioProcess?.pid.toString(), '/f', '/t']);
    this.clear();
  }

  /**
   * Clear process and reset state.
   */
  private clear(): void {
    this.currentAudioProcess = null;
    this.state = State.NONE;
  }
}
