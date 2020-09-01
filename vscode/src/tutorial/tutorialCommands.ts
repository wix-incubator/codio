import { commands, Uri, Command, Task, TaskGroup, tasks, ShellExecution, TaskRevealKind, TaskPanelKind } from 'vscode';
import { TUTORIAL_COMMAND_NAMES } from './consts';
import { PLAY_CODIO } from '../consts/command_names';
import { markStepDone } from './store';
import { getStepUri, getWorkspaceFolder, getTempTestStatus, cleanTempTestStatus } from './filesystem';

export const createStepCommand = (stepId: string, step: TutorialStep): Command | undefined => {
  switch (step.type) {
    case 'codio':
      return {
        command: TUTORIAL_COMMAND_NAMES.codioStepPress,
        title: 'Play Codio',
        arguments: [stepId, getStepUri(step)],
      };
    case 'md':
      return { command: TUTORIAL_COMMAND_NAMES.mdStepPress, title: 'Show Step', arguments: [stepId, getStepUri(step)] };
    case 'test':
      return {
        command: TUTORIAL_COMMAND_NAMES.testStepPress,
        title: 'Run Challenge',
        arguments: [stepId, getStepUri(step)],
      };
    case 'comment':
      return {
        command: TUTORIAL_COMMAND_NAMES.commentStepPress,
        title: 'View Step',
        arguments: [stepId, getStepUri(step)],
      };
  }
};

export const registerTutorialCommands = () => {
  commands.registerCommand(TUTORIAL_COMMAND_NAMES.codioStepPress, (stepId: string, codioUri, workspaceUri) => {
    commands.executeCommand(PLAY_CODIO, codioUri, workspaceUri);
    markStepDone(stepId);
  });

  commands.registerCommand(TUTORIAL_COMMAND_NAMES.mdStepPress, (stepId: string, mdUri: Uri) => {
    commands.executeCommand('markdown.showPreview', mdUri);
    markStepDone(stepId);
  });

  commands.registerCommand(TUTORIAL_COMMAND_NAMES.testStepPress, async (stepId: string, testUri: Uri) => {
    const testTask = new Task(
      { name: 'Tutorial Task', type: 'test' },
      getWorkspaceFolder(),
      'Tutorial',
      'bla',
      new ShellExecution(`node ./.tutorial/tests/testScript.js ${getWorkspaceFolder().uri.fsPath} ${stepId}`),
      'js',
    );
    testTask.group = TaskGroup.Test;
    testTask.presentationOptions = {
      reveal: TaskRevealKind.Always,
      focus: true,
      panel: TaskPanelKind.Dedicated,
      echo: false,
      showReuseMessage: true,
      clear: true,
    };
    tasks.executeTask(testTask);
    tasks.onDidEndTaskProcess((e) => {
      try {
        if (getTempTestStatus(stepId) === '0') {
          markStepDone(stepId);
        }
      } finally {
        cleanTempTestStatus(stepId);
      }
    });
  });

  commands.registerCommand(TUTORIAL_COMMAND_NAMES.commentStepPress, (stepId: string) => {
    markStepDone(stepId);
  });
};
