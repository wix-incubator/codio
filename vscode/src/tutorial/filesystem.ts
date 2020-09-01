import { writeFileSync, readFileSync, unlinkSync } from 'fs';
import { workspace, RelativePattern, Uri } from 'vscode';
import { join } from 'path';
import {
  MAIN_FOLDER,
  TUTORIAL_FILE,
  PROGRESS_FILE,
  CODIOS_FOLDER_NAME,
  MARKDOWN_FOLDER_NAME,
  TESTS_FOLDER_NAME,
  COMMENTS_FOLDER_NAME,
} from './consts';
import { getFileContent } from '../utils';

//@TODO: support multiple workspaces
export const getWorkspaceFolder = () => workspace.workspaceFolders[0];

export const persistProgress = (progress: TutorialProgress) =>
  writeFileSync(getProgressPath(getTutorialFolderPath()), JSON.stringify(progress));
const getTutorialFolderPath = () =>
  getWorkspaceFolder() ? join(getWorkspaceFolder()?.uri.fsPath, MAIN_FOLDER) : undefined;

const getTutorialConfigPath = (tutorialFolderPath: string) => join(tutorialFolderPath, TUTORIAL_FILE);
const getProgressPath = (tutorialFolderPath: string) => join(tutorialFolderPath, PROGRESS_FILE);

const getCodioPath = (name: string) => join(getTutorialFolderPath()!, CODIOS_FOLDER_NAME, name + '.codio');
const getMarkdownPath = (name: string) => join(getTutorialFolderPath()!, MARKDOWN_FOLDER_NAME, name + '.md');
const getTestPath = (name: string) => join(getTutorialFolderPath()!, TESTS_FOLDER_NAME, name);
const getCommentPath = (name: string) => join(getTutorialFolderPath()!, COMMENTS_FOLDER_NAME, name + '.json');
const getTempTestStatusPath = (stepId: string): string =>
  join(getTutorialFolderPath()!, TESTS_FOLDER_NAME, `./tmp/${stepId}.txt`);

export const getTempTestStatus = (stepId: StepId) => readFileSync(getTempTestStatusPath(stepId)).toString();
export const cleanTempTestStatus = (stepId: StepId) => unlinkSync(getTempTestStatusPath(stepId));

export const getTutorialFolderRelativePattern = () => new RelativePattern(getTutorialFolderPath(), '**/*');

export const getTutorial = async (): Promise<Tutorial | undefined> => {
  const tutorialFolderPath = getTutorialFolderPath();
  if (tutorialFolderPath) {
    const tutorial = await getFileContent(getTutorialConfigPath(tutorialFolderPath));
    return tutorial as Tutorial;
  }
};

export const getProgress = async (): Promise<TutorialProgress | undefined> => {
  const tutorialFolderPath = getTutorialFolderPath();
  if (tutorialFolderPath) {
    const tutorial = await getFileContent(getProgressPath(tutorialFolderPath));
    return tutorial as TutorialProgress;
  }
};

export const getStepUri = (step: TutorialStep): Uri => {
  if (step.path) {
    return Uri.file(join(getWorkspaceFolder().uri.fsPath, step.path));
  } else {
    let stepPath;
    switch (step.type) {
      case 'codio':
        stepPath = getCodioPath(step.name);
        break;
      case 'md':
        stepPath = getMarkdownPath(step.name);
        break;
      case 'test':
        stepPath = getTestPath(step.name);
        break;
      case 'comment':
        stepPath = getCommentPath(step.name);
        break;
      default:
        throw new Error(`Step Type invalid. Got stepType: ${step.type}`);
    }
    return Uri.file(stepPath);
  }
};
