import { removeSelection } from '../editor/event_dispatcher';
import { createFrame, applyFrame } from '../editor/frame';
import deserializeEvents from '../editor/deserialize';
import {
  createTimelineWithAbsoluteTimes,
  cutTimelineFrom,
  runThroughTimeline,
  cutTimelineUntil,
  createRelativeTimeline,
} from '../editor/event_timeline';
import deserializeFrame from '../editor/frame/deserialize_frame';
import {
  getInteracterContent,
  addInteracterContentToFrame,
  getCurrentFrameWithInteracterContent,
} from './InteracterContentHandler';
export default class CodeEditorPlayer {
  currentActionTimer: any;
  events: Array<CodioEvent>;
  initialFrame: Array<CodioFile>;
  workspaceFolder: string;

  constructor(workspacePath, timeline) {
    this.events = deserializeEvents(timeline.events, workspacePath);
    this.initialFrame = deserializeFrame(timeline.initialFrame, workspacePath);
  }

  play(events: Array<CodioEvent>, time) {
    const timeline = createTimelineWithAbsoluteTimes(events, time);
    runThroughTimeline(timeline, (timer) => (this.currentActionTimer = timer));
  }

  async moveToFrame(time: number, interacterMode = true) {
    const initialToCurrentFrameActions = cutTimelineUntil(this.events, time);
    let interacterContent, finalFrame;
    if (interacterMode) {
      interacterContent = getInteracterContent(getCurrentFrameWithInteracterContent(this.initialFrame));
    }
    const frame = createFrame(this.initialFrame, initialToCurrentFrameActions);
    if (interacterMode) {
      finalFrame = addInteracterContentToFrame(frame, interacterContent);
    }
    await applyFrame(finalFrame || frame);
  }

  getTimeline(relativeTimeToStart: number) {
    const timelineFromTime = cutTimelineFrom(this.events, relativeTimeToStart);
    return createRelativeTimeline(timelineFromTime, relativeTimeToStart);
  }

  pause() {
    clearTimeout(this.currentActionTimer);
    removeSelection();
  }
}
