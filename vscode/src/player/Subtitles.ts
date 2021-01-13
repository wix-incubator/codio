import * as vscode from 'vscode';
import * as parser from 'subtitles-parser-vtt';

/**
 * Cue object properties.
 */
interface Cue {
  id: number;
  startTime: number;
  endTime: number;
  text: string;
}

/**
 * Class handles loading and manipulation of the subtitles.
 */
export default class Subtitles {
  private oc: vscode.OutputChannel;
  private timerRef: NodeJS.Timer;
  private cues: Cue[] = [];
  private startMS: number;

  /**
   * Create Output Channel.
   */
  constructor() {
    this.oc = vscode.window.createOutputChannel('Codio Subtitles');
  }

  /**
   * Load given subtitles file and create dictionary.
   * @param filePath Subtitles file to load.
   * @returns True if loaded correctly, false otherwise.
   */
  async load(filePath: string): Promise<boolean> {
    const uri = vscode.Uri.file(filePath);

    try {
      const srtData = (await vscode.workspace.openTextDocument(uri)).getText();
      this.cues = parser.fromSrt(srtData, 'ms');
      if (!this.cues.length) {
        throw new Error('No subtitles found.');
      }

      this.display('Codio Subtitles Loaded');
    } catch (error) {
      console.warn('Subtitles Load', error.message);
      return false;
    }

    return true;
  }

  /**
   * Release memory and guard against future errors.
   */
  destroy(): void {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    this.play = () => {};
    this.oc.dispose();
    this.oc = null;
  }

  /**
   * Display given string on the output channel.
   * @param str String to display.
   */
  private display(str: string) {
    this.oc.show(true);
    this.oc.appendLine(str);
  }

  /**
   * Format given cue into a string.
   * @param cue Cue to format into a string.
   * @returns Formatted string to display.
   */
  private getCueStr(cue: Cue): string {
    return parser.msToSrt(cue.startTime) + '\t' + cue.text;
  }

  /**
   * Play subtitles from given milliseconds.
   * @param timeMs Milliseconds into subtitles to play.
   */
  play(timeMs = 0): void {
    this.stop();

    if (!timeMs) {
      this.oc.clear();
      this.display('Codio Subtitles Starting...');
    }

    const cue = this.cues.find((cue) => {
      return cue.startTime >= timeMs;
    });
    this.startMS = Date.now() - timeMs;
    this.showCue(cue, cue.startTime - timeMs);
  }

  /**
   * Show given cue at given delay.
   * @param cue The current cue to show.
   * @param delay Time in milliseconds to delay showing given cue.
   */
  showCue(cue: Cue, delay: number): void {
    if (!cue || delay === NaN) {
      return;
    }

    this.timerRef = setTimeout(() => {
      this.display(this.getCueStr(cue));

      cue = this.cues[cue.id]; // id points to the next cue in array because id starts from 1.
      const elapsed = Date.now() - this.startMS;
      const delay = cue?.startTime - elapsed; // optional because we could have processed the last cue.

      this.showCue(cue, delay);
    }, delay);
  }

  /**
   * Pause subtitles display.
   */
  pause(): void {
    this.stop();
  }

  /**
   * Stop subtitles display.
   */
  stop(): void {
    clearTimeout(this.timerRef);
  }
}
