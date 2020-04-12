# Codio Format

## About
Codio Format is an open source media format for developers to record and playback the process of programming. It combines code editor operations and audio.

## Getting Started With Codio Format in VSCode

### Setup

1) Install FFMPEG: `brew install ffmpeg`.
    FFMPEG is how we record and and play audio files. You can read more about it [here](https://www.ffmpeg.org/).

2) Get the Codio Format extension from the marketplace:

That's it! Follow along for instructions or see the [video link placeholder]
>Note: Currently Codio does not support Windows, but we are working on it!
### Recording a Codio
[gif placeholder]

You can record a codio through the command palette using the `Codio: Record Codio` command.

Codio will then prompt you to name your recording. When you are done, Codio will start recording.

You can finish the recording session through the command palette using the `Codio: Save Recording` command or by pressing cancel on the recording progress message.

By default (that can be changeed via [API](#api)) codio files will be saved in the codio library, located at `~/Library/codio/codios`.

### Playing a Codio
[gif placeholder]

You can play a codio recording through the command palette or the Explorer tree viewer:
-  Use the `Codio: Play Codio` command from the command palette.
-  Browse the Codio Tree Viewer under the Explorer tab. It will show all codios it can find in your codio library, which is located at `~/Library/codio/codios`. Press on one of the codios and a session will start.


#### Controlling a Codio Session - Pause, Rewind and Forward
When playing a codio, a progress indicator will be displayed and three additional buttons will appear in the editor navigation menu at the top right of each open file:
* Rewind 10 seconds
* Pause/Resume
* Forward 10 seconds

You can control the codio session by using any one of those buttons. You can end the codio session by closing the progress message. This will also remove the buttons.

## API - 0.1.0

At its core, Codio is a project meant to be used as infrastructure for other projects.

It exposes the following API for other extensions to use:

`recordCodio(destination: Uri, workspaceRoot?: Uri): void` - Records a codio. `destination` specifices where the codio file should be saved. `workspaceRoot` is required if you want to replay the recording on a project with the same file structure.

`finishRecording(): void` - Finish and save the current ongoing codio recording. Note that a recording can be halted by the user, either by calling the `Codio: Save Recording` command from the command palette or through the recording progress UI.

`playCodio(source: Uri, workspaceRoot?: Uri): void` - Plays a codio. If `workspaceRoot` is passed, the codio will be played on the files of that workspace, otherwise it will use temporary files. For this to work, you will have to pass `workspaceRoot` when recording.

> Note: Currently Codio exposes only three methods, but we aim to expose more functionality in the future - such as dealing with user input mid-recording, support for execution and more. Please feel free to open an issue!
