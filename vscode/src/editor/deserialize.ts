import FSManager from "../filesystem/FSManager";
import { Uri, Range, Position, Selection } from "vscode";
import {isSerializedTextEvent, isSerializedSelectionEvent, isSerializedVisibleRangeEvent, isSerializedEditorEvent } from "./event_creator";

export default function deserializeEvents(events: Array<CodioSerializedEvent>, codioPath) : Array<CodioEvent> {
  return events.map(serializedEvent => {
    const event = deserializeFilePath(serializedEvent, codioPath);
    if (isSerializedTextEvent(event)) {
      return deserializeTextEvent(event);
    } else if (isSerializedSelectionEvent(event)) {
      return deserializeSelectionEvent(event);
    } else if (isSerializedVisibleRangeEvent(event)){
      return deserializeVisibleRangeEvent(event);
    } else if (isSerializedEditorEvent(event)) {
      return deserializeEditorEvent(event);
    } else {
      return event;
    }
  });
}

function deserializeFilePath(event: CodioSerializedEvent, codioPath: string) {
  if (event.data.path) {
    const {path, ...eventData } = event.data;
    const newEvent = {...event, data: {...eventData, uri: Uri.file(
      FSManager.toFullPath(codioPath, path)
    )}};
    return newEvent;
  } else {
    return event;
  }
}

function deserializeTextEvent(event: CodioSerializedTextEvent) : CodioTextEvent {
  return {
    ...event,
    //@ts-ignore
    data: {
      ...event.data,
      changes: event.data.changes.map(change => {
        if (change.range) {
          return { ...change, range: deserializeRange(change.range) };
        } else if (change.position) {
          return { ...change, position: deserializePosition(change.position) };
        }
      })
    }
  };
}

function deserializeSelectionEvent(event: CodioSerializedSelectionEvent) : CodioSelectionEvent {
  return {
    ...event,
    //@ts-ignore
    data: {
      ...event.data,
      selections: event.data.selections.map(selection => {
        return new Selection(
          deserializePosition(selection.anchor),
          deserializePosition(selection.active)
        );
      })
    }
  };
}

function deserializeVisibleRangeEvent(event: CodioSerializedVisibleRangeEvent) : CodioVisibleRangeEvent {
  return {
    ...event,
    //@ts-ignore
    data: {
      ...event.data,
      visibleRange: deserializeRange(event.data.visibleRange)
    }

  };
}

function deserializeEditorEvent(event: CodioSerializedChangeActiveEditorEvent) : CodioChangeActiveEditorEvent {
  return {
    ...event,
    //@ts-ignore
    data: {
      ...event.data,
      visibleRange: deserializeRange(event.data.visibleRange)
    }
  };
}
function deserializeRange(range): Range {
  const startPosition = new Position(range[0].line, range[0].character);
  const endPosition = new Position(range[1].line, range[1].character);
  return new Range(startPosition, endPosition);
}

function deserializePosition(position): Position {
  return new Position(position.line, position.character);
}
