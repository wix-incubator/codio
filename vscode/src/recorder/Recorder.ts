import CodeEditorRecorder from './Editor';
import Timer from '../ProgressTimer';
import FSManager from '../filesystem/FSManager';
import { Uri, commands } from 'vscode';
import AudioHandler from '../audio/Audio';

const CODIO_FORMAT_VERSION = '0.1.0';
export default class Recorder {
  audioRecorder: AudioHandler;
  codeEditorRecorder: CodeEditorRecorder;
  timer: Timer;
  codioPath: string;
  destinationFolder?: Uri;
  workspaceRoot?: Uri;
  codioName: string;

  recordingStartTime: number;
  recordingLength = 0;
  isRecording = false;

  recordingSavedObservers: Array<Function> = [];
  process: any;
  stopRecordingResolver: Function;

  async loadCodio(codioPath: string, codioName: string, destinationFolder?: Uri, workspaceRoot?: Uri) {
    if (this.isRecording) {
      await this.stopRecording();
      this.saveRecording();
    }
    this.setInitialState(codioPath, codioName, destinationFolder, workspaceRoot);
  }

  setInitialState = (codioPath, codioName, destinationFolder, workspaceRoot) => {
    this.codioPath = codioPath;
    this.codioName = codioName;
    this.destinationFolder = destinationFolder;
    this.workspaceRoot = workspaceRoot;
    this.audioRecorder = new AudioHandler(FSManager.audioPath(this.codioPath));
    this.codeEditorRecorder = new CodeEditorRecorder();
    this.timer = new Timer();
    this.process = undefined;
    this.recordingSavedObservers = [];
  };

  executeFile() {
    this.codeEditorRecorder.executeFile();
  }

  onTimerUpdate(observer) {
    this.timer.onUpdate(observer);
  }

  onRecordingSaved(observer) {
    this.recordingSavedObservers.push(observer);
  }

  startRecording() {
    this.isRecording = true;
    this.codeEditorRecorder.record();
    this.audioRecorder.record();
    this.timer.run();
    this.process = new Promise((resolve) => (this.stopRecordingResolver = resolve));
    this.recordingStartTime = Date.now() + 300;
    commands.executeCommand('setContext', 'inCodioRecording', true);
  }

  async setRecordingDevice(): Promise<boolean> {
    return this.audioRecorder.setDevice();
  }

  async stopRecording() {
    await this.audioRecorder.stopRecording();
    this.codeEditorRecorder.stopRecording();
    this.timer.stop();
    this.recordingLength = Date.now() - this.recordingStartTime;
    this.stopRecordingResolver();
    this.isRecording = false;
    commands.executeCommand('setContext', 'inCodioRecording', false);
  }

  async saveRecording() {
    try {
      const codioTimelineContent = this.codeEditorRecorder.getTimelineContent(
        this.recordingStartTime,
        this.workspaceRoot,
      );
      const codioJsonContent = { ...codioTimelineContent, codioLength: this.recordingLength };
      const metadataJsonContent = { length: this.recordingLength, name: this.codioName, version: CODIO_FORMAT_VERSION };
      await FSManager.saveRecordingToFile(
        codioJsonContent,
        metadataJsonContent,
        codioJsonContent.codioEditors,
        this.codioPath,
        this.destinationFolder,
      );
      this.recordingSavedObservers.forEach((obs) => obs());
    } catch (e) {
      console.log('Saving recording failed', e);
    }
  }
}
