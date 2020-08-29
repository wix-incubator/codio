import { workspace, Uri } from "vscode"
import { join } from "path";
import { getFileContent } from "../utils";
import { MAIN_FOLDER, TUTORIAL_FILE, PROGRESS_FILE, CODIOS_FOLDER_NAME, MARKDOWN_FOLDER_NAME, TESTS_FOLDER_NAME, COMMENTS_FOLDER_NAME } from "./consts";

// @TODO: support multiple workspaces
const getTutorialFolderPath = () => workspace.workspaceFolders[0] ? join(workspace.workspaceFolders[0]?.uri.fsPath, MAIN_FOLDER) : undefined

const getTutorialConfigPath = tutorialFolderPath => join(tutorialFolderPath, TUTORIAL_FILE)
const getProgressPath = tutorialFolderPath => join(tutorialFolderPath, PROGRESS_FILE)

const getCodioPath =  name => join(getTutorialFolderPath()!, CODIOS_FOLDER_NAME, name)
const getMarkdownPath =  name => join(getTutorialFolderPath()!, MARKDOWN_FOLDER_NAME, name)
const getTestPath = name => join(getTutorialFolderPath()!, TESTS_FOLDER_NAME, name)
const getCommentPath = name => join(getTutorialFolderPath()!, COMMENTS_FOLDER_NAME, name)


export const getTutorial = async () : Promise<Tutorial | undefined>=> {
    const tutorialFolderPath = getTutorialFolderPath()
    if (tutorialFolderPath) {
        const tutorial = await getFileContent(getTutorialConfigPath(tutorialFolderPath))
        return tutorial as Tutorial
    }
}

export const getProgress = async () : Promise<TutorialProgress | undefined>=> {
    const tutorialFolderPath = getTutorialFolderPath()
    if (tutorialFolderPath) {
        const tutorial = await getFileContent(getProgressPath(tutorialFolderPath))
        return tutorial as TutorialProgress
    }
}

export const createTutorialStore = async () : Promise<TutorialStore | undefined>=> {
    const [progress, tutorial] = await Promise.all([getProgress(), getTutorial()])
    //@TODO: Validate that loaded tutorial conforms to the tutorial datastructure
    if (progress && tutorial) return { progress, tutorial}
}

export const updateProgress = async () => {

}

const isStepDone = (status: ProgressStatus) => status === "done" || status === "watched"

const calculateChapterProgress = (store: TutorialStore, chapterId: string) => {
    const stepIds = store.tutorial.chaptersById[chapterId].steps
    const totalDoneSteps = stepIds.reduce((doneSteps, stepId) => isStepDone(store.progress.progressByStepId[stepId]?.status) ? doneSteps + 1 : doneSteps  ,0)
    return Math.floor(stepIds.length / totalDoneSteps * 100)
}

const getStep = (store: TutorialStore, id: string): TutorialStep => store.tutorial.stepsById[id]

const getStepUri = (step: TutorialStep) : Uri => { 
    if (step.path) {
        Uri.file(step.path)
    } else {
        let stepPath;
        switch (step.type) {
            case 'codio':
                stepPath = getCodioPath(step.name)
                break
            case 'md': 
                stepPath = getMarkdownPath(step.name)
                break
            case 'test':
                stepPath = getTestPath(step.name)
                break
            case 'comment':
                stepPath = getCommentPath(step.name)
                break
            default:
                throw new Error(`Step Type invalid. Got stepType: ${step.type}`)
        }
        return Uri.file(stepPath)
    }
}

export const getStepUriAndNameWithStepId = (store: TutorialStore, id: string) : {uri: Uri, name: string} => {
    const step = getStep(store, id)
    const uri = getStepUri(step)
    return {
        uri, 
        name: step.name   
    }
}