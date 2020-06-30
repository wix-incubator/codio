export default class CodioProgressTimer {
  codioLength: number | undefined;
  timer: NodeJS.Timer;
  currentSecond: number;

  private onUpdateObservers: Array<Function> = [];
  private onFinishObservers: Array<Function> = [];

  constructor(codioLengh?: number) {
    this.codioLength = codioLengh;
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

  run(codioTime = 0) {
    try {
      if (this.timer) {
        clearInterval(this.timer);
      }
      this.currentSecond = codioTime;
      this.timer = setInterval(() => {
        this.currentSecond++;
        if (this.codioLength && this.currentSecond > this.codioLength / 1000) {
          this.onFinishObservers.forEach((observer) => observer());
          clearInterval(this.timer);
          this.onUpdateObservers.forEach((observer) => observer(this.codioLength / 1000, this.codioLength / 1000));
        } else {
          this.onUpdateObservers.forEach((observer) => observer(this.currentSecond, this.codioLength / 1000));
        }
      }, 1000);
    } catch (e) {
      console.log('report progress error,', e);
    }
  }
}
