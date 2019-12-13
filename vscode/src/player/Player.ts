import AudioPlayer from './Audio';
import CodeEditorPlayer from './Editor';
import Timer from '../ProgressTimer';
import FSManager from '../filesystem/FSManager';

export default class Player {
    isPlaying: boolean = false;
    codioPath: string;

    tutorialLength: number;
    tutorialStartTime: number;
    tutorialRelativeActiveTime: number = 0;
    lastStoppedTime: number = 0;

    codeEditorPlayer: CodeEditorPlayer;
    audioPlayer: AudioPlayer;
    timer: Timer;

    closeTutorialResolver: any;
    process: any;

    async loadCodio(codioPath) {
        try {
            this.setInitialState();
            this.codioPath = codioPath;
            const timeline = await FSManager.loadTimeline(this.codioPath);
            this.tutorialLength = timeline.tutorialLength;
            this.codeEditorPlayer = new CodeEditorPlayer(FSManager.workspacePath(this.codioPath), timeline);
            this.audioPlayer = new AudioPlayer(FSManager.audioPath(this.codioPath));
            this.timer = new Timer(this.tutorialLength);
            this.timer.onFinish(() => this.pause());
        } catch (e) {
            console.log('load tutorial failed', e);
        }
    }

    setInitialState() {
        this.tutorialRelativeActiveTime = 0;
        this.lastStoppedTime = 0;
        this.tutorialStartTime = undefined;
        this.tutorialLength = undefined;
        this.closeTutorialResolver = undefined;
        this.process = undefined;
    }

    async startTutorial() {
        try {
            this.process = new Promise((resolve) => this.closeTutorialResolver = resolve);
            await this.codeEditorPlayer.moveToFrame(0);
            this.play(this.codeEditorPlayer.events, this.tutorialRelativeActiveTime);
        } catch(e) {
            console.log('startTutorial failed', e);
        }
    }

    play(actions: Array<any>, tutorialTime: number) {
        this.tutorialStartTime = Date.now();
        this.codeEditorPlayer.play(actions, this.tutorialStartTime);
        this.audioPlayer.play(tutorialTime);
        this.timer.run(tutorialTime);
        this.isPlaying = true;
    }

    pause() {
        this.lastStoppedTime = Date.now();
        this.codeEditorPlayer.pause();
        this.audioPlayer.pause();
        this.timer.stop();
        this.tutorialRelativeActiveTime = this.tutorialRelativeActiveTime + (this.lastStoppedTime - this.tutorialStartTime);
        this.isPlaying = false;
    }

    resume() {
        this.playFrom(this.tutorialRelativeActiveTime);
    }

    closeTutorial() {
        this.timer.stop();
        this.audioPlayer.pause();
        this.closeTutorialResolver();
    }

    onTimerUpdate(observer) {
        this.timer.onUpdate(observer);
    }

    rewind(s) {
        if (this.isPlaying) {
            this.pause();
        }
        let timeToRewind = this.tutorialRelativeActiveTime - (s * 1000);
        if (timeToRewind < 0) {
            timeToRewind = 0;
        }
        this.playFrom(timeToRewind);
    }

    forward(s) {
        //todo: when tutorial is less then 10 seconds bbefore end finish.
        if (this.isPlaying) {
            this.pause();
        }
        this.playFrom(this.tutorialRelativeActiveTime + (s * 1000));
    }

    async playFrom(relativeTimeToStart: number) {
        try {
            if (this.isPlaying) {
                this.codeEditorPlayer.pause();
                this.audioPlayer.pause();
                this.timer.stop();
            }
            await this.codeEditorPlayer.moveToFrame(relativeTimeToStart);
            this.tutorialRelativeActiveTime = relativeTimeToStart;
            const relevantRelativeActions = this.codeEditorPlayer.getTimeline(relativeTimeToStart);
            const timeToStartInSeconds = relativeTimeToStart / 1000;
            this.play(relevantRelativeActions, timeToStartInSeconds);
        } catch(e) {
            console.log('play from fail', e);
        }
    }
}

