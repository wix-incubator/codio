import { window, ProgressLocation, StatusBarItem, StatusBarAlignment } from 'vscode';
import Player from '../player/Player';
import Recorder from '../recorder/Recorder';
import { finishRecording } from '../commands';
import * as COMMAND_NAMES from '../consts/command_names';

export const showCodioNameInputBox = async () => await window.showInputBox({ prompt: 'Give your codio a name:' });

export const showChooseAudioDevice = async (items: string[]): Promise<string | undefined> => {
  const audioDevice = await window.showQuickPick(items, { placeHolder: 'Choose an Audio Device to record from' });
  return audioDevice;
};

export const showPlayFromInputBox = async (player) =>
  await window.showInputBox({
    prompt: `Choose when to start from in seconds. Full Length is ${player.codioLength / 1000}`,
  });

export const MESSAGES = {
  startingToRecord: 'Starting to record',
  abortRecording: 'Aborted Recording.',
  savingRecording: 'Saving recording...',
  recordingSaved: 'Recording saved.',
  cantPlayWhileRecording: 'Cant play Codio while recording',
  alreadyPlaying: 'You already have a Codio playing.',
  invalidNumber: `Number is invalid`,
  noActiveCodio: "You don't have an active Codio",
  windowsNotSupported: 'Unfortunately, Codio Format does not work on Windows.',
  ffmpegNotAvailable: `Looks like you haven't installed ffmpeg, which is required for Codio to work.
     You can install it with brew: "brew install ffmpeg"`,
  emptyCodioNameInvalid: 'No name, No Codio',
  noRecordingDeviceAvailable: 'Codio Could not find an audio recording device',
  noActiveWorkspace: 'You need to have an active workspace to record a Codio',
};
class UIController {
  shouldDisplayMessages: boolean;
  private statusBar: StatusBarItem;

  constructor(shouldDisplayMessages) {
    this.shouldDisplayMessages = shouldDisplayMessages;
  }

  /**
   * Create a status bar item to write codio progress to.
   * @param context Context from when the extension was activated.
   */
  createStatusBar(context): void {
    if (this.statusBar) {
      this.statusBar.dispose();
    }

    this.statusBar = window.createStatusBarItem(StatusBarAlignment.Right, 101);
    this.statusBar.command = COMMAND_NAMES.STOP_CODIO;
    this.statusBar.tooltip = 'Click to stop codio.';

    context.subscriptions.push(this.statusBar);
  }

  showMessage(message): void {
    if (this.shouldDisplayMessages) {
      window.showInformationMessage(message);
    }
  }

  /**
   * Show codio progress on status bar item. 
   * @param player Player to get updates from.
   */
  showStatusBarProgress(player: Player) {
    this.statusBar.show();

    player.onTimerUpdate(async (currentTime, totalTime) => {
      const percentage = (currentTime / totalTime) * 100;
      this.statusBar.text = `$(megaphone) Codio $(mention)${Math.round(percentage)}% - ${Math.round(currentTime)}ms/${Math.round(totalTime)}ms $(stop-circle)`;
    });

    player.process.then(() => {
      this.statusBar.hide();
    });
  }

  showRecorderProgressBar(recorder: Recorder) {
    if (!this.shouldDisplayMessages) {
      return;
    }

    window.withProgress(
      {
        location: ProgressLocation.Notification,
        title: 'Recording Codio. ',
        cancellable: true,
      },
      async (progress, token) => {
        token.onCancellationRequested(() => finishRecording(recorder));
        recorder.onTimerUpdate(async (currentTime) => {
          progress.report({ message: `${currentTime}` });
        });
        await recorder.process;
      },
    );
  }
}

export const UI = new UIController(false);
