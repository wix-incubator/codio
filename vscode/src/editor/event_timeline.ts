import dispatchEvent from './event_dispatcher';

function createEventWithModifiedTime(event: CodioEvent, newTime: number): CodioEvent {
  return {
    ...event,
    data: {
      ...event.data,
      time: newTime,
    },
  };
}

export function createRelativeTimeline(events: Array<CodioEvent>, startTime: number): Array<any> {
  return events.map((event) => {
    const newTime = event.data.time - startTime;
    return createEventWithModifiedTime(event, newTime);
  });
}

export function cutTimelineFrom(events: Array<CodioEvent>, time: number): Array<CodioEvent> {
  return events.filter((event) => event.data.time > time);
}

export function cutTimelineUntil(events: Array<CodioEvent>, time: number): Array<CodioEvent> {
  return events.filter((event) => event.data.time < time);
}

export function createTimelineWithAbsoluteTimes(
  eventsWithRelativeTimeline: Array<CodioEvent>,
  startTime: number,
): Array<CodioEvent> {
  return eventsWithRelativeTimeline.map((event) => {
    const newTime = event.data.time + startTime;
    return createEventWithModifiedTime(event, newTime);
  });
}

export function runThroughTimeline(timeline: Array<CodioEvent> = [], setCurrentActionTimer: Function) {
  if (!timeline.length) {
    return;
  }
  try {
    const event = timeline[0];
    let sleepTime = event.data.time - Date.now();
    setCurrentActionTimer(
      setTimeout(async () => {
        await dispatchEvent(event);
        if (timeline.length !== 1) {
          runThroughTimeline(timeline.slice(1), setCurrentActionTimer);
        }
      }, Math.max(sleepTime, 0)),
    );
  } catch (e) {
    console.log('timeline error', e);
  }
}
