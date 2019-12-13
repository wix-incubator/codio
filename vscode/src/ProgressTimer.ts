export default class CodioProgressTimer {
    tutorialLength: number | undefined;
    timer: NodeJS.Timer;
    currentSecond: number;

    private onUpdateObservers: Array<Function> = [];
    private onFinishObservers: Array<Function> = [];

    constructor(tutorialLengh?: number) {
        this.tutorialLength = tutorialLengh;
    }

    onFinish(observer) {
        this.onFinishObservers.push(observer);
    }

    onUpdate(observer) {
        this.onUpdateObservers.push(observer);
    }

    stop() {
        clearInterval(this.timer);
    }

    run(tutorialTime = 0) {
        try {
            if (this.timer) { clearInterval(this.timer); }
            this.currentSecond = tutorialTime;
            this.timer = setInterval(() => {
                this.currentSecond++;
                if (this.tutorialLength && this.currentSecond > this.tutorialLength / 1000) {
                    this.onFinishObservers.forEach(observer => observer());
                    clearInterval(this.timer);
                    this.onUpdateObservers.forEach(observer => observer(this.tutorialLength / 1000, this.tutorialLength / 1000));
                } else {
                    this.onUpdateObservers.forEach(observer => observer(this.currentSecond, this.tutorialLength / 1000));
                }
            }, 1000);
        } catch(e) {
            console.log('report progress error,', e);
        }
    }
}
