# Record and playback the process of programming

## Getting Started

### Setup
First let's get everything in place:

1) Install FFMPEG: `brew install ffmpeg`.

   FFMPEG is how we record and and play audio files. You can read more about it [here](https://www.ffmpeg.org/).
2) Get the Codio Format extension from the market place:


See Demo Video here:

### Recording a Codio

You can record a codio through the command pallete: `Codio: Record Codio`

Codio will then prompt you to give your recording a name. After giving the recording a name the codio recording will start.

You can finish the recording session by using the `Codio: Save Recording` command or by pressing cancel on the recording progress message (This is a bit off).

If a Uri is not specified when recording a codio (see [API](#api)) Codios will be saved in the codio library, located at `~/library/codio/codios`

gif:

### Playing a Codio
You can play a codio through the command pallete or the explorer tree viewer:
-  Use `Codio: Play Codio` from the command pallete.
-  The Codio Tree Viewer is located inside the file explorer. It will show all codios it can find in your codio library, which is located at `~/library/codio/codios`.

When playing a codio a codio progress message will be displayed and three additional buttons will show on the top right of your file: rewind, pause/resume and forward. You can control the codio session by playing any one of those buttons. You can end the Codio session by closing the progress message - which will also remove the buttons.

gif:

## API

At its core, Codio is a project meant to be used as infrastrucutre for other projects. As such it exposes the following API for other extensions to use:

`recordCodio(destination?: Uri, workspaceRoot?: Uri): void` - Records a Codio. `destionation` specifices where the codio should be saved. WorkspaceRoot enables you to determine the root . This is required if you want to replay the recording on the same project.

`finishRecording(): void` - Finish and save the current ongoing Codio recording. Note that a recoding can be

`playCodio(source: Uri, workspaceRoot?: Uri): void` - Plays a codio. If workspaceRoot is passed, the codio will be played on that on that workspace, otherwise on temporary files. For this to work, you will have to pass workspaceRoot when recording.

