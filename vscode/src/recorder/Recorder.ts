import CodeEditorRecorder from './Editor';
import AudioRecorder from './Audio';
import Timer from '../ProgressTimer';
import FSManager from '../filesystem/FSManager';

export default class Recorder {
    audioRecorder: AudioRecorder;
    codeEditorRecorder: CodeEditorRecorder;
    timer: Timer;
    codioPath: string;
    codioName: string;

    recordingStartTime: number;
    recordingLength: number = 0;
    isRecording: boolean = false;

    recordingSavedObservers: Array<Function> = [];
    process: any;
    stopRecordingResolver: Function;


    loadCodio(codioPath: string, codioName: string) {
        if (this.isRecording) {
            this.stopRecording();
            this.saveRecording();
        }
        this.setInitialState(codioPath, codioName);
    }

    setInitialState = (codioPath, codioName) => {
        this.codioPath = codioPath;
        this.codioName = codioName;
        this.audioRecorder = new AudioRecorder(FSManager.audioPath(this.codioPath));
        this.codeEditorRecorder = new CodeEditorRecorder();
        this.timer = new Timer();
        this.process = undefined;
        this.recordingSavedObservers = [];
    }

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
        this.process = new Promise((resolve) => this.stopRecordingResolver = resolve);
        this.recordingStartTime = Date.now() + 300;
    }

    stopRecording() {
        this.isRecording = false;
        this.audioRecorder.stopRecording();
        this.codeEditorRecorder.stopRecording();
        this.timer.stop();
        this.recordingLength = Date.now() - this.recordingStartTime;
        this.stopRecordingResolver();
    }

    async saveRecording() {
        try {
            const codioTimelineContent = this.codeEditorRecorder.getTimelineContent(this.recordingStartTime);
            const codioJsonContent = {...codioTimelineContent, codioLength: this.recordingLength };
            const metadataJsonContent = {length: this.recordingLength, name: this.codioName};
            await FSManager.saveRecordingToFile(codioJsonContent, metadataJsonContent, codioJsonContent.codioEditors,  this.codioPath);
            this.recordingSavedObservers.forEach(obs => obs());
        } catch(e) {
            console.log('Saving recording failed', e);
        }
    }
}