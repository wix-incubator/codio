import * as vscode from 'vscode';
import { progressToEmoji, stepTypeToEmoji, TREE_VIEW_ID, PROGRESS_STATUS } from './consts';
import {
  calculateTutorialProgress,
  createTutorialStore,
} from './store';
import { createStepCommand } from './tutorialCommands';
import { getTutorialFolderRelativePattern } from './filesystem';

const updateTutorial = async (
  treeView: vscode.TreeView<ChapterTreeItem | vscode.TreeItem>,
  dataProvider: TutorialDataProvider,
) => {
  const tutorialStore = await createTutorialStore();
  dataProvider.refresh(tutorialStore);
  //@ts-ignore
  treeView.title = getTreeViewTitle(tutorialStore);
};

const getTreeViewTitle = (store: TutorialStore) => `${store.tutorial.title} :`;

export const registerTutorialTreeView = async (extensionPath: string) => {
  const tutorialStore = await createTutorialStore();
  const tutorialDataProvider = new TutorialDataProvider(tutorialStore, extensionPath);
  const treeView = vscode.window.createTreeView(TREE_VIEW_ID, { treeDataProvider: tutorialDataProvider });
  //@ts-ignore
  treeView.title = getTreeViewTitle(tutorialStore);
  const fileSystemWatcher = vscode.workspace.createFileSystemWatcher(getTutorialFolderRelativePattern());
  vscode.workspace.onDidChangeWorkspaceFolders(() => updateTutorial(treeView, tutorialDataProvider));
  fileSystemWatcher.onDidChange(() => updateTutorial(treeView, tutorialDataProvider));
};

const getChapterCollapsibleState = (status: ProgressStatus) => {
  if (status === PROGRESS_STATUS.done || status === PROGRESS_STATUS.watched) {
    return vscode.TreeItemCollapsibleState.Collapsed
  }
  if (status === PROGRESS_STATUS.locked) {
    return vscode.TreeItemCollapsibleState.None
  } else return vscode.TreeItemCollapsibleState.Expanded
}
class ChapterTreeItem extends vscode.TreeItem {
  public steps: StepTreeItem[];
  progress: ProgressStatus;

  constructor(label: string, status: ProgressStatus | undefined, steps: StepTreeItem[], extensionPath: string) {
    const statusEmoji = progressToEmoji[status]
    const collapseState = getChapterCollapsibleState(status)
    super(
      `${statusEmoji} ${label}`,
     collapseState,
    );
    this.steps = steps;
  }
}

class StepTreeItem extends vscode.TreeItem {
  name: string;
  type: StepType;
  status: ProgressStatus;

  constructor(stepId: string, step: TutorialStep, stepProgress: ProgressStatus) {
    const statusEmoji = stepProgress ? progressToEmoji[stepProgress] : '⚪️';
    const typeEmoji = stepTypeToEmoji[step.type];
    const name = `${statusEmoji} ${step.name} ${typeEmoji}`
    super(name, vscode.TreeItemCollapsibleState.None);
    this.command = createStepCommand(stepId, step);
  }
}

const createProgressMessage = (percent: number) =>
  percent === 100
    ? `🏆 You are Done! Amazing job! 🏆`
    : `${percent}% 🥬${'_'.repeat((100 - percent) / 5)}🐢${'_'.repeat((100 - (100 - percent)) / 5)}`;

const createTreeItems = (store: TutorialStore, extensionPath: string): Array<ChapterTreeItem | vscode.TreeItem> => {
  const totalProgressPercent = calculateTutorialProgress(store);
  const progressMessage = createProgressMessage(totalProgressPercent);
  return [
    new vscode.TreeItem(progressMessage, vscode.TreeItemCollapsibleState.None),
    ...store.tutorial.chapters.map((chapterId) => {
      const stepTreeItems = store.tutorial.chaptersById[chapterId].steps.map((stepId) => {
        const step = store.tutorial.stepsById[stepId];
        return new StepTreeItem(stepId, step, store.progress.progressByStepId[stepId]?.status);
      });
      return new ChapterTreeItem(
        store.tutorial.chaptersById[chapterId].title,
        store.progress.progressByChapterId[chapterId]?.status,
        stepTreeItems,
        extensionPath,
      );
    }),
  ];
};

export class TutorialDataProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
  private extensionPath: string;
  store: TutorialStore | undefined;
  _onDidChangeTreeData: vscode.EventEmitter<vscode.TreeItem | undefined> = new vscode.EventEmitter<
    vscode.TreeItem | undefined
  >();
  onDidChangeTreeData: vscode.Event<vscode.TreeItem | undefined> = this._onDidChangeTreeData.event;

  refresh(store): void {
    this.store = store;
    this._onDidChangeTreeData.fire(undefined);
  }

  constructor(store, extensionPath) {
    this.store = store;
    this.extensionPath = extensionPath;
  }

  getTreeItem(element: vscode.TreeItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
    return element;
  }

  getChildren(
    element?: ChapterTreeItem | StepTreeItem | vscode.TreeItem | undefined,
  ): Array<ChapterTreeItem | vscode.TreeItem> | StepTreeItem[] | undefined {
    if (element === undefined) {
      if (this.store) {
        return createTreeItems(this.store, this.extensionPath);
      } else {
        return undefined;
      }
    }
    if (element instanceof ChapterTreeItem) return element.steps;
  }
}
