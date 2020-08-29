import * as vscode from 'vscode'
import { join } from 'path';
import { progressToEmoji, stepTypeToIcon, stepTypeToEmoji } from './consts';

const exampleTutorial = {
  tutorial: {
    chapters : ["1","2","3"],
    chaptersById: {
        "1": {
          title: 'Intro, How it works and JS Basics',
          steps: ["1","2", "3"]
        },
        "2": {
          title: "Data Structures",
          steps: ["4","5", "6", "7"]
        },
        "3": {
          title: 'Working with Servers',
          steps: ["8", "9", "10"]
      }
    },
    stepsById: {
        "1": {
          type: 'codio' as const,
          name: 'How this works',
        }, 
        "2": {
          type: 'md' as const,
          name: 'Js basics',
        }, 
        "3": {
          type: 'codio' as const,
          name: 'const, var, let',
        }, 
        "4": {
          type: 'test' as const,
          name: 'Promise: playground',
        }, 
        "5": {
          type: 'comment' as const,
          name: 'Async await',
        }, 
        "6": {
          type: 'codio' as const,
          name: 'React',
        }, 
        "7": {
          type: 'codio' as const,
          name: 'Observe',
        }, 
        "8": {
          type: 'test' as const,
          name: 'That is why it',
        }, 
        "9": {
          type: 'codio' as const,
          name: 'Meet Yael',
        }, 
        "10": {
          type: 'md' as const,
          name: 'React',
        }
    },
    version: 1
  },
  progress: {
    progressByStepId: {
        "1": {
          status: 'done' as const
        }, 
        "2": {
          status: 'watched' as const
        }, 
        "3": {
          status: 'skipped' as const
        },
        "4": {
          status: 'done' as const
        } 
    } ,
    progressByChapterId: {
      "1": {
        status: 'done' as const
      }
    }
  }
}

export const registerTutorialTreeView = async ( extensionPath: string) => {
  const tutorialDataProvider = new TutorialDataProvider(extensionPath);
  vscode.window.createTreeView('tutorial', { treeDataProvider: tutorialDataProvider });
  vscode.workspace.onDidChangeWorkspaceFolders(() => tutorialDataProvider.refresh());
}

class ChapterTreeItem extends vscode.TreeItem {
  public steps: StepTreeItem[]
  progress: ProgressStatus

  constructor(label: string, status: ProgressStatus | undefined, steps: StepTreeItem[], extensionPath: string) {
    
    const statusEmoji = status ? progressToEmoji[status] : '🔒'
    super(
        `${statusEmoji} ${label}`,
        status ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None);
    this.steps = steps;
  }
}


class StepTreeItem extends vscode.TreeItem {
  name: string;
  type: StepType
  status: ProgressStatus 

  constructor(step: TutorialStep, stepProgress: ProgressStatus) {
    const statusEmoji = stepProgress ? progressToEmoji[stepProgress] : '⚪️'
    const typeEmoji = stepTypeToEmoji[step.type]
    super(
      `${statusEmoji} ${step.name} ${typeEmoji}`,
      vscode.TreeItemCollapsibleState.None);
      
  }
}

const createTreeItems = (store: TutorialStore, extensionPath: string) : Array<ChapterTreeItem|vscode.TreeItem> => {
  return [
    new vscode.TreeItem('React Native From Scratch', vscode.TreeItemCollapsibleState.None),
    new vscode.TreeItem('23% 🥬_____________🐢__________', vscode.TreeItemCollapsibleState.None),
    ...store.tutorial.chapters.map(chapterId => {
      const stepTreeItems = store.tutorial.chaptersById[chapterId].steps.map(stepId => {
        const step = store.tutorial.stepsById[stepId]
        return new StepTreeItem(step, store.progress.progressByStepId[stepId]?.status)
      })
      return new ChapterTreeItem(store.tutorial.chaptersById[chapterId].title, store.progress.progressByChapterId[chapterId]?.status, stepTreeItems, extensionPath)
    })
  ]
}

export class TutorialDataProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
    private extensionPath: string;
  
    _onDidChangeTreeData: vscode.EventEmitter<vscode.TreeItem | undefined> = new vscode.EventEmitter<
      vscode.TreeItem | undefined
    >();
    onDidChangeTreeData: vscode.Event<vscode.TreeItem | undefined> = this._onDidChangeTreeData.event;
  
    refresh(): void {
      this._onDidChangeTreeData.fire(undefined);
    }
  
    constructor(extensionPath) {
      this.extensionPath = extensionPath;
    }
  
    getTreeItem(element: vscode.TreeItem): vscode.TreeItem|Thenable<vscode.TreeItem> {
      return element;
    }

    async getChildren(element?: ChapterTreeItem | StepTreeItem | vscode.TreeItem | undefined): Promise<Array<ChapterTreeItem|vscode.TreeItem> | StepTreeItem[] | undefined> {
      if (element === undefined) {
        return createTreeItems(exampleTutorial, this.extensionPath);
      } 
      if (element instanceof ChapterTreeItem)
        return element.steps
    }
  }




          //   return allCodios.map((codio) => {
        //     const codioItem = new vscode.TreeItem(codio.name);
        //     codioItem.iconPath = {
        //       dark: join(this.extensionPath, 'media/icon-small.svg'),
        //       light: join(this.extensionPath, 'media/icon-small-light.svg'),
        //     };
        //     // codioItem.command = { command: PLAY_CODIO, title: 'Play Codio', arguments: [codio.uri, codio.workspaceRoot] };
        //     codioItem.contextValue = 'codio';
        //     return codioItem;
        //   });
        //   const recordCodioItem = new vscode.TreeItem('Record Codio');
        // //   recordCodioItem.command = {
        // //     // command: RECORD_CODIO_AND_ADD_TO_PROJECT,
        // //     title: 'Record Codio and Add to Project',
        // //     arguments: [],
        // //   };
        //   recordCodioItem.contextValue = 'codio';
        //   return [recordCodioItem];
