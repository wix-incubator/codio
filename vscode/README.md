# Codio Format

## About
Codio Format is an open source media format for developers to record and playback the process of programming. It combines code editor operations and audio.

You can use codio to create interactive tutorials, messages and documentation that run inside your IDE.

## Getting Started With Codio Format in VSCode

### Setup

1) Install FFmpeg: `brew install ffmpeg`.
 If you are using windows you can either download it from [here](https://www.ffmpeg.org/) and add it to your path, or use a tool like [chocolatey](https://chocolatey.org/packages/ffmpeg) which will handle that for you.

  FFmpeg is how we record and play audio files. You can read more about it [here](https://www.ffmpeg.org/).

2) Get the Codio Format extension from [the marketplace](https://marketplace.visualstudio.com/items?itemName=wix.codio)

### Recording a Codio

<img width="800px" src="./docs/recording%20a%20codio.gif" />

You can record a codio through the command palette using the `Codio: Record Codio` and `Codio: Record Codio and Add to Project` commands or the the Codio View in the explorer tab.

Codio will then prompt you to name your recording. When you are done, Codio will start recording.

You can finish the recording session through the command palette using the `Codio: Save Recording` command or by pressing cancel on the recording progress message. You can also use the save icon in the control panel of the Codio View, under the explorer tab.

if your are using the `Codio: Record Codio and Add to Project` command, codios will be saved in a `.codio` folder in your current open workspace. If you use the `Codio: Record Codio` command, codio files will be saved in the codio library, located at `~/Library/codio/codios`.

### Playing a Codio

<img width="800px" src="./docs/Playing%20a%20codio.gif" />

You can play a codio recording through the command palette or the Explorer tree viewer:
-  Use the `Codio: Play Codio` command from the command palette.
-  Browse the Codio Tree Viewer under the Explorer tab. It will show all codios it can find in your project, under the `.codio` folder, and in the Codio library, which is located at `~/Library/codio/codios`. Press on one of the codios and a session will start.


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

`pauseOrResume(): void` - Pauses or resumes the current codio session.

> Note: We aim to expose more functionality in the future - such as dealing with user input mid-recording, support for execution and more. Please feel free to open an issue!
