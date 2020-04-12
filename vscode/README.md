# Codio Format

## About
Codio Format is an open source media format for developers to record and replay the process of programming. It combines operations on a code editor and audio.

## Getting Started With Codio Format in VSCode

### Setup

1) Install FFMPEG: `brew install ffmpeg`.
    FFMPEG is how we record and and play audio files. You can read more about it [here](https://www.ffmpeg.org/).
2) Get the Codio Format extension from the market place:

That's it!
>Note: Codio Currently does not support Windows but we are working on it!
### Recording a Codio

You can record a codio through the command palette using the `Codio: Record Codio` command.

Codio will then prompt you to name your recording. When you are done, the codio recording will start.

You can finish the recording session through the command palette using the `Codio: Save Recording` command or by pressing cancel on the recording progress message.

If a Uri is not specified (see [API](#api)) codios will be saved in the codio library, located at `~/Library/codio/codios`

gif:

### Playing a Codio
You can play a codio through the command palette or the explorer tree viewer:
-  Use the `Codio: Play Codio` command from the command palette.
-  Browse the Codio Tree Viewer under the Explorer tab. It will show all codios it can find in your codio library, which is located at `~/Library/codio/codios`.

When playing a codio a progress message will be displayed and three additional buttons will show on the top right of your file: rewind 10 seconds, pause/resume and forward 10 seconds. You can control the codio session by using any one of those buttons. You can end the Codio session by closing the progress message - that will also remove the buttons.

gif:

## API - 0.1.0

At its core, Codio is a project meant to be used as infrastructure for other projects. It exposes the following API for other extensions to use:

`recordCodio(destination?: Uri, workspaceRoot?: Uri): void` - Records a Codio. `destionation` specifices where the codio should be saved. `workspaceRoot` lets codio know what is the relative root path. This is required if you want to replay the recording on the same project.

`finishRecording(): void` - Finish and save the current ongoing Codio recording. Note that a recording can be halted by the user, either by calling the `Codio: Save Recording` command from the command or through recording progress UI.

`playCodio(source: Uri, workspaceRoot?: Uri): void` - Plays a codio. If workspaceRoot is passed, the codio will be played on that on that workspace, otherwise on temporary files. For this to work, you will have to pass workspaceRoot when recording.

> Note: Currently Codio exposes only three methods, but we aim to expose more functionality in the future - such as dealing with user input mid recording, support for executers etc. Please feel free to open an issue!
