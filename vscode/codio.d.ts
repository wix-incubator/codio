export declare const recordCodio: (destination: Uri, workspaceRoot?: Uri, getCodioName?: () => Promise<string>) => void;
export declare const finishRecording: () => Promise<void>;
export declare const playCodio: (source: Uri, workspaceUri?: Uri) => void;
export declare const pauseCodio: () => void;
export declare const pauseOrResume: () => void;
export declare const resumeCodio: () => void;
export declare const playFrom: (time: any) => Promise<void>;
export declare const rewind: (time: any) => void;
export declare const forward: (time: any) => void;