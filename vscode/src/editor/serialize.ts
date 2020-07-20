import { Position, Range } from 'vscode';
import FSManager from '../filesystem/FSManager';
import { isTextEvent, isSelectionEvent, isEditorEvent, isExecutionEvent, isVisibleRangeEvent } from './event_creator';

export default function serialize(events: Array<CodioEvent>, rootPath: string): Array<CodioSerializedEvent> {
  return events
    .map((event) => {
      return serializeEvent(event, rootPath);
    })
    .filter((event) => !!event);
}

function serializeEvent(event: CodioEvent, rootPath): CodioSerializedEvent {
  if (isTextEvent(event)) {
    return serializeTextEvent(event, rootPath);
  } else if (isSelectionEvent(event) || isEditorEvent(event) || isExecutionEvent(event) || isVisibleRangeEvent(event)) {
    return serializeFilePath(event, rootPath);
  }
}

function serializeTextEvent(event: CodioTextEvent, rootPath): CodioSerializedTextEvent {
  serializeFilePath(event, rootPath);
  if (event.data.changes.length === 0) {
    console.log('event with 0 length', event);
    //@TODO: figure out which actions do not have a change
    return undefined;
  }
  const { uri, ...eventData } = event.data;
  const serializedEvent = {
    ...event,
    data: {
      ...eventData,
      path: FSManager.toRelativePath(uri, rootPath),
      changes: [],
    },
  };
  serializedEvent.data.changes = event.data.changes.map((change) => {
    const range = change.range;
    const rangeLength = change.rangeLength;
    const startPosition = new Position(range.start.line, range.start.character);
    const endPosition = new Position(range.end.line, range.end.character);
    if (rangeLength === 0) {
      return { position: startPosition, value: change.text };
    }
    return { range: new Range(startPosition, endPosition), value: change.text };
  });
  return serializedEvent;
}

function serializeFilePath(event: CodioEvent, rootPath): CodioSerializedEvent {
  if (event.data.uri) {
    const { uri, ...eventData } = event.data;
    const newEvent = {
      ...event,
      data: {
        ...eventData,
        path: FSManager.toRelativePath(event.data.uri, rootPath),
      },
    };
    return newEvent;
  }
}
