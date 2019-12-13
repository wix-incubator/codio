import { MESSAGES, showMessage, showTutorialNameInputBox } from "../user_interface/messages";

export async function createTutorial(fsManager) {
    const tutorialName = await showTutorialNameInputBox();
    if (tutorialName) {
        fsManager.createTutorial(tutorialName);
        showMessage(MESSAGES.tutorialCreated);
    }
}

export async function addCodioToTutorial(fsManager) {
    const tutorialId = await fsManager.chooseTutorial();
    const codioId  = await fsManager.chooseCodio();
    await fsManager.addCodioToTutorial(tutorialId, codioId);
}