import { window, ProgressLocation } from "vscode";
import Player from "../player/Player";
import Recorder from "../recorder/Recorder";
import { finishRecording } from "../commands";

export const showCodioNameInputBox = async () =>
  await window.showInputBox({ prompt: "Give your codio a name:" });

  export const showChooseAudioDevice = async (items: string[]) : Promise<string | undefined> => {
    const audioDevice = await window.showQuickPick(items, {placeHolder: 'Choose an Audio Device to record from'});
    return audioDevice;
  };


export const showPlayFromInputBox = async (player) =>
  await window.showInputBox({
    prompt: `Choose when to start from in seconds. Full Length is ${
      player.codioLength / 1000
    }`,
  });

export const MESSAGES = {
  startingToRecord: "Starting to record",
  abortRecording: "Aborted Recording.",
  savingRecording: "Saving recording...",
  recordingSaved: "Recording saved.",
  cantPlayWhileRecording: "Cant play Codio while recording",
  codioStart: "Codio is about to start..",
  stopCodio: "Stopping current codio..",
  codioPaused: "Paused Paused.",
  alreadyPlaying: "You already have a Codio playing.",
  invalidNumber: `Number is invalid`,
  noActiveCodio: "You don't have an active Codio",
  windowsNotSupported: "Unfortunately, Codio Format does not work on Windows.",
  ffmpegNotAvailable: `Looks like you haven't installed ffmpeg, which is required for Codio to work.
     You can install it with brew: "brew install ffmpeg"`,
  noRecordingDeviceAvailable: "Codio Could not find an audio recording device",
  noActiveWorkspace: "You need to have an active workspace to record a Codio"
};

class UIController {
  shouldDisplayMessages: boolean;

  constructor(shouldDisplayMessages) {
    this.shouldDisplayMessages = shouldDisplayMessages;
  }

  showMessage(message): void {
    if (this.shouldDisplayMessages) {
      window.showInformationMessage(message);
    }
  }

  showPlayerProgressBar(player: Player) {
    if (this.shouldDisplayMessages) {
      window.withProgress(
        {
          location: ProgressLocation.Notification,
          title: "Playing Codio",
          cancellable: true,
        },
        async (progress, token) => {
          token.onCancellationRequested(() => {
            player.pause();
            player.closeCodio();
          });
          let lastPercentage = 0;
          player.onTimerUpdate(async (currentTime, totalTime) => {
            const percentage = (currentTime * 100) / totalTime;
            const increment = percentage - lastPercentage;
            progress.report({
              increment,
              message: `${currentTime}/${totalTime}`,
            });
            lastPercentage = percentage;
          });
          await player.process;
        }
      );
    }
  }

  showRecorderProgressBar(recorder: Recorder) {
    if (this.shouldDisplayMessages) {
      window.withProgress(
        {
          location: ProgressLocation.Notification,
          title: "Recording Codio. ",
          cancellable: true,
        },
        async (progress, token) => {
          token.onCancellationRequested(() => finishRecording(recorder));
          recorder.onTimerUpdate(async (currentTime) => {
            progress.report({ message: `${currentTime}` });
          });
          await recorder.process;
        }
      );
    }
  }
}

export const UI = new UIController(false);
