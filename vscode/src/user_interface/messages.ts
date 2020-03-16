import {window} from 'vscode';

export async function doYouWantToOverridePrompt() {
    const result = await window.showWarningMessage("Are you sure you want to override the existing tutorial?", {modal: true}, {title: "Yes"}, {title: "No", isCloseAffordance: true});
    if (result && result.title === "Yes") {
        return true;
    } else {
        return false;
    }
}
export const showTutorialNameInputBox = async () => await window.showInputBox({prompt: "Give your tutorial a name:"});
export const showCodioNameInputBox = async () => await window.showInputBox({prompt: "Give your codio a name:"});
export const showPlayFromInputBox = async (player) => await window.showInputBox({prompt: `Choose when to start from in seconds. Full Length is ${player.codioLength / 1000}`});

export const MESSAGES = {
    startingToRecord : 'Starting to record',
    abortRecording : 'Aborted Recording.',
    savingRecording : 'Saving recording...',
    recordingSaved : 'Recording saved.',
    cantPlayWhileRecording : 'Cant play Codio while recording',
    codioStart : 'Codio is about to start..',
    stopCodio : 'Stopping current codio..',
    codioPaused : 'Paused Paused.',
    alreadyPlaying : 'You already have a Codio playing.',
    invalidNumber : `Number is invalid`,
    noActiveCodio : "You don't have an active Codio",
    tutorialCreated : `Tutorial Created`,
    signUpCodeSucces : 'Sign up successful!',
    signUpCodeFail : "Sign up unsuccesful...",
    codioDownloadSuccess : 'Codio downloaded.',
    codioDownloadFail : 'Could not download codio.',
    tutorialDownloadSuccess : `Tutorial downloaded.`,
    tutorialDownloadFail : `Could not download tutorial`,
    emailTaken : 'Seems like your email is taken...',
    signUpFail : 'Something went wrong when signing up..',
};

export const showMessage = window.showInformationMessage


