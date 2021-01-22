import CodeEditorPlayer from './Editor';
import Timer from '../ProgressTimer';
import FSManager from '../filesystem/FSManager';
import { commands } from 'vscode';
import AudioHandler from '../audio/Audio';

export default class Player {
  isPlaying = false;
  codioPath: string;

  codioLength: number;
  codioStartTime: number;
  relativeActiveTime = 0;
  lastStoppedTime = 0;

  codeEditorPlayer: CodeEditorPlayer;
  audioPlayer: AudioHandler;
  timer: Timer;

  closeCodioResolver: any;
  process: any;

  async loadCodio(codioPath, workspaceToPlayOn?: string) {
    try {
      this.setInitialState();
      this.codioPath = codioPath;
      const timeline = await FSManager.loadTimeline(this.codioPath);
      this.codioLength = timeline.codioLength;
      this.codeEditorPlayer = new CodeEditorPlayer(
        workspaceToPlayOn ? workspaceToPlayOn : FSManager.workspacePath(this.codioPath),
        timeline,
      );
      this.audioPlayer = new AudioHandler(FSManager.audioPath(this.codioPath));
      this.timer = new Timer(this.codioLength);
      this.timer.onFinish(() => this.pause());
    } catch (e) {
      console.log('loadCodio failed', e);
    }
  }

  setInitialState() {
    this.relativeActiveTime = 0;
    this.lastStoppedTime = 0;
    this.codioStartTime = undefined;
    this.codioLength = undefined;
    this.closeCodioResolver = undefined;
    this.process = undefined;
  }

  async startCodio() {
    try {
      this.process = new Promise((resolve) => (this.closeCodioResolver = resolve));
      await this.codeEditorPlayer.moveToFrame(0);
      this.play(this.codeEditorPlayer.events, this.relativeActiveTime);
      commands.executeCommand('setContext', 'inCodioSession', true);
    } catch (e) {
      console.log('startCodio failed', e);
    }
  }

  play(actions: Array<any>, timeToStart: number) {
    if (this.isPlaying) {
      this.codeEditorPlayer.pause();
      this.audioPlayer.pause();
      this.timer.stop();
    }
    this.codioStartTime = Date.now();
    this.codeEditorPlayer.play(actions, this.codioStartTime);
    this.audioPlayer.play(timeToStart);
    this.timer.run(timeToStart);
    this.isPlaying = true;
  }

  pause() {
    this.lastStoppedTime = Date.now();
    this.codeEditorPlayer.pause();
    this.audioPlayer.pause();
    this.timer.stop();
    this.relativeActiveTime = this.relativeActiveTime + (this.lastStoppedTime - this.codioStartTime);
    this.isPlaying = false;
  }

  resume() {
    this.playFrom(this.relativeActiveTime);
  }

  //@TODO: should closeCodio just call pause? sometime it is called with pause before and sometime it doesn't. Probably a mistake
  closeCodio() {
    this.timer.stop();
    this.audioPlayer.pause();
    this.closeCodioResolver();
    commands.executeCommand('setContext', 'inCodioSession', false);
  }

  onTimerUpdate(observer) {
    this.timer.onUpdate(observer);
  }

  rewind(s) {
    if (this.isPlaying) {
      this.pause();
    }
    let timeToRewind = this.relativeActiveTime - s * 1000;
    if (timeToRewind < 0) {
      timeToRewind = 0;
    }
    this.playFrom(timeToRewind);
  }

  forward(s) {
    if (this.isPlaying) {
      this.pause();
    }
    let timeToForward = this.relativeActiveTime + s * 1000;
    if (timeToForward > this.codioLength) {
      timeToForward = this.codioLength;
    }
    this.playFrom(timeToForward);
  }

  async playFrom(relativeTimeToStart: number) {
    try {
      if (this.isPlaying) {
        this.codeEditorPlayer.pause();
        this.audioPlayer.pause();
        this.timer.stop();
      }
      await this.codeEditorPlayer.moveToFrame(relativeTimeToStart);
      this.relativeActiveTime = relativeTimeToStart;
      const relevantRelativeActions = this.codeEditorPlayer.getTimeline(relativeTimeToStart);
      const timeToStartInSeconds = relativeTimeToStart / 1000;
      this.play(relevantRelativeActions, timeToStartInSeconds);
    } catch (e) {
      console.log('play from fail', e);
    }
  }
}
