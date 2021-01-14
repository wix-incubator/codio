import CodeEditorPlayer from './Editor';
import Timer from '../ProgressTimer';
import FSManager from '../filesystem/FSManager';
import { commands } from 'vscode';
import AudioHandler from '../audio/Audio';
import Subtitles from './Subtitles';

const IS_PLAYING = "isPlaying";
const IN_CODIO_SESSION = "inCodioSession";

export default class Player {
  isPlaying = false;
  codioPath: string;

  codioLength: number;
  codioStartTime: number;
  relativeActiveTime = 0;
  lastStoppedTime = 0;

  codeEditorPlayer: CodeEditorPlayer;
  audioPlayer: AudioHandler;
  subtitlesPlayer: Subtitles;
  timer: Timer;

  closeCodioResolver: any;
  process: any;

  /**
   * Create all media needed for the codio.
   * @param codioPath Path where codio was unzipped to access files.
   * @param workspaceToPlayOn Path of the current workspace.
   */
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
      this.subtitlesPlayer = new Subtitles();
      const loaded = await this.subtitlesPlayer.load(FSManager.subtitlesPath(this.codioPath));
      if (!loaded) {
        this.subtitlesPlayer.destroy();
      }
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
      this.updateContext(IN_CODIO_SESSION, true);
    } catch (e) {
      console.log('startCodio failed', e);
    }
  }

  /**
   * Update given context to given value and update manager.
   * @param context String representing context to update.
   * @param value Value to set given context string to.
   */
  private updateContext(context: string, value: any): void {
    commands.executeCommand('setContext', context, value);
    FSManager.update();
  }

  /**
   * Play actions and media from given time in seconds.
   * @param actions An array of action objects for the CodeEditorPlayer to parse.
   * @param timeToStart Seconds to start playing media from.
   */
  play(actions: Array<any>, timeToStart: number): void {
    if (this.isPlaying) {
      this.pauseMedia();
    }
    this.codioStartTime = Date.now();
    this.codeEditorPlayer.play(actions, this.codioStartTime);
    this.subtitlesPlayer.play(timeToStart * 1000);
    this.audioPlayer.play(timeToStart);
    this.timer.run(timeToStart);
    this.isPlaying = true;
    this.updateContext(IS_PLAYING, this.isPlaying);
  }

  /**
   * Pause all media types: Editor, Audio, Subtitles, and Timeline.
   */
  pauseMedia() {
    this.codeEditorPlayer.pause();
    this.audioPlayer.pause();
    this.subtitlesPlayer.pause();
    this.timer.stop();
  }

  pause() {
    this.lastStoppedTime = Date.now();
    this.pauseMedia();
    this.relativeActiveTime = this.relativeActiveTime + (this.lastStoppedTime - this.codioStartTime);
    this.isPlaying = false;
    this.updateContext(IS_PLAYING, this.isPlaying);
  }

  resume() {
    this.playFrom(this.relativeActiveTime);
  }

  //@TODO: should closeCodio just call pause? sometime it is called with pause before and sometime it doesn't. Probably a mistake
  closeCodio() {
    this.timer.stop();
    this.audioPlayer.pause();
    this.subtitlesPlayer.stop();
    this.closeCodioResolver();
    this.updateContext(IN_CODIO_SESSION, false);
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
        this.pauseMedia();
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
