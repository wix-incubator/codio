import { removeSelection } from '../editor/event_dispatcher';
import { createFrame, applyFrame } from '../editor/frame';
import deserializeEvents from '../editor/deserialize';
import { Uri, window } from 'vscode';
import { join } from 'path';
import { overrideEditorText } from '../utils';
import {
  createTimelineWithAbsoluteTimes,
  cutTimelineFrom,
  runThroughTimeline,
  cutTimelineUntil,
  createRelativeTimeline,
} from '../editor/event_timeline';
import deserializeFrame from '../editor/frame/deserialize_frame';
import { getInitialFilePathAndContentFromFrame } from '../editor/frame/create_frame';
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

  //todo: moveToFrame should use create+applyFrame when time is 0
  async moveToFrame(time: number) {
    if (time === 0) {
      const { uri, content } = getInitialFilePathAndContentFromFrame(this.initialFrame);
      await window.showTextDocument(uri);
      await overrideEditorText(window.activeTextEditor, content);
    } else {
      const initialToCurrentFrameActions = cutTimelineUntil(this.events, time);
      // const interacterContent = getInteracterContent(this.tutorial);
      const frame = createFrame(this.initialFrame, initialToCurrentFrameActions);
      // const finalFrame = addInteracterContentToFrame(frame, interacterContent);
      await applyFrame(frame);
    }
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
