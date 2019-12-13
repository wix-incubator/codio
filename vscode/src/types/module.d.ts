declare interface CodioEvent {
  type: string;
  data: {
    uri?: Uri | undefined;
    time: number;
  };
}

declare interface CodioSerializedEvent {
    type: string,
    data: {
        path?: string | undefined,
        time: numbebr
    }
}
declare interface CodioTextEvent extends CodioEvent {
  type: "text";
  data: {
    uri: Uri;
    changes: TextDocumentContentChangeEvent[];
    time: number;
  };
}

declare interface CodioSerializedTextEvent extends CodioSerializedEvent {
    type: "text";
    data: {
      path: string;
      changes: TextDocumentContentChangeEvent[];
      time: number;
    };
  }

declare interface CodioVisibleRangeEvent extends CodioEvent {
    type: "visibleRange";
    data: {
      uri: Uri;
      time: number;
      visibleRange: Range;
    };
}

declare interface CodioSerializedVisibleRangeEvent extends CodioSerializedEvent {
    type: "visibleRange";
    data: {
      path: string;
      time: number;
      visibleRange: Range;
    };
}
declare interface CodioSelectionEvent extends CodioEvent {
  type: "selection";
  data: {
    uri: Uri;
    selections: Selection[];
    time: number;
  };
}

declare interface CodioSerializedSelectionEvent extends CodioSerializedEvent {
    type: "selection";
    data: {
      path: string;
      selections: Selection[];
      time: number;
    };
}

declare interface CodioExecutionEvent extends CodioEvent {
  type: "exec";
  data: {
    executionOutput: string;
    time: number;
  };
}

declare interface CodioSerializedExecutionEvent extends CodioSerializedEvent {
  type: "exec";
  data: {
    executionOutput: string;
    time: number;
  };
}

declare interface CodioChangeActiveEditorEvent extends CodioEvent {
  type: "editor";
  data: {
    uri: Uri;
    time: number;
    isInitial: boolean;
    content: string;
    viewColumn: ViewColumn;
    visibleRange: Range;
    selections: Selection[];
  };
}

declare interface CodioSerializedChangeActiveEditorEvent implements CodioSerializedEvent {
    type: "editor";
    data: {
      path: string;
      time: number;
      isInitial: boolean;
      content: string;
      viewColumn: ViewColumn;
      visibleRange: [{
          line: number
          character: number
        },
        {
          line: number
          character: number
      }]
      selections: Selection[];
    };
}

declare interface CodioFile {
  document: ShadowDocument;
  column: ViewColumn;
  uri: Uri;
  lastAction: number;
}

declare interface CodioSerializedFile {
  text: string;
  column: number;
  path: string;
  lastActionCount: number;
}

declare type CodioFrame = Array<CodioFile>
