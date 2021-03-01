import * as vscode from 'vscode';
import FSManager from '../filesystem/FSManager';
import { PLAY_CODIO, RECORD_CODIO_AND_ADD_TO_PROJECT } from '../consts/command_names';
import { join } from 'path';
import * as parser from 'subtitles-parser-vtt';

export async function registerTreeViews(fsManager: FSManager, extensionPath: string) {
  const codioTreeDataProvider = new CodiosDataProvider(fsManager, extensionPath);
  vscode.window.createTreeView('codioMessages', { treeDataProvider: codioTreeDataProvider });
  fsManager.onCodiosChanged(() => codioTreeDataProvider.refresh());
  vscode.workspace.onDidChangeWorkspaceFolders(() => codioTreeDataProvider.refresh());
}

export class CodiosDataProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
  codios: Array<any>;
  fsManager: FSManager;
  private extensionPath: string;

  _onDidChangeTreeData: vscode.EventEmitter<vscode.TreeItem | undefined> = new vscode.EventEmitter<
    vscode.TreeItem | undefined
  >();
  onDidChangeTreeData: vscode.Event<vscode.TreeItem | undefined> = this._onDidChangeTreeData.event;

  refresh(): void {
    this._onDidChangeTreeData.fire(undefined);
  }

  constructor(fsManager, extensionPath) {
    this.fsManager = fsManager;
    this.extensionPath = extensionPath;
  }

  getTreeItem(element): vscode.TreeItem {
    return element;
  }

  async getChildren(element?: vscode.TreeItem): Promise<vscode.TreeItem[]> {
    const workspaceCodios = await this.fsManager.getWorkspaceCodios();
    const libraryCodios = await this.fsManager.getLibraryCodios();

    if (!workspaceCodios.length && !libraryCodios.length) {
      return [new RecordActionItem(this.extensionPath)];
    }

    if (!element) {
      return [
        new vscode.TreeItem('Workspace Codios', vscode.TreeItemCollapsibleState.Collapsed),
        new vscode.TreeItem('Library Codios', vscode.TreeItemCollapsibleState.Collapsed),
      ];
    }

    if (element.label === 'Workspace Codios') {
      return workspaceCodios.map((codio) => new CodioItem(codio, this.extensionPath));
    }

    if (element.label === 'Library Codios') {
      return libraryCodios.map((codio) => new CodioItem(codio, this.extensionPath));
    }
  }
}

/**
 * Creates an interactive item to record a codio.
 */
class RecordActionItem extends vscode.TreeItem {
  constructor(extensionPath: string) {
    super('Record Codio');
    this.iconPath = {
      dark: join(extensionPath, 'media/dark/microphone.svg'),
      light: join(extensionPath, 'media/light/microphone.svg'),
    };
    this.command = {
      command: RECORD_CODIO_AND_ADD_TO_PROJECT,
      title: 'Record Codio and Add to Project',
      arguments: [],
    };
    this.contextValue = 'codio';
  }
}

/**
 * Creates an interactive item to play a codio.
 */
class CodioItem extends vscode.TreeItem {
  constructor(codio: Codio, extensionPath: string) {
    super(codio.name);
    this.iconPath = {
      dark: join(extensionPath, 'media/dark/icon-small.svg'),
      light: join(extensionPath, 'media/light/icon-small.svg'),
    };
    this.command = { command: PLAY_CODIO, title: 'Play Codio', arguments: [codio.uri, codio.workspaceRoot] };
    this.description = this.getTimeDescription(codio.length);
    this.tooltip = this.getMsTooltip(codio.length);
    this.contextValue = 'codio';
  }

  /**
   * Format given milliseconds to ISO 8601 time format.
   * @param ms Milliseconds to format.
   * @returns ISO 8601 time format from given milliseconds.
   */
  private getTimeDescription(ms: number): string {
    const roundedSec = Math.round(+('0.' + (ms % 1000))) * 1000;
    const srt = parser.msToSrt(ms + roundedSec);
    return `${srt.split(',')[0]}`;
  }

  /**
   * Format given milliseconds to human readable format.
   * @param ms Milliseconds to format.
   * @returns Formatted milliseconds given.
   */
  private getMsTooltip(ms: number): string {
    return Intl.NumberFormat('en-US', {
      style: 'unit',
      // error TS2345 - NumberFormat does not have unit and unitDisplay properties.
      // https://github.com/microsoft/TypeScript/issues/38012
      // @ts-ignore
      unit: 'millisecond',
      unitDisplay: 'narrow'
    }).format(ms);
  }
}

export const cursorStyle = vscode.window.createTextEditorDecorationType({
  dark: {
    backgroundColor: vscode.workspace.getConfiguration('codio').get<string>('cursorColorDarkTheme'),
  },
  light: {
    backgroundColor: vscode.workspace.getConfiguration('codio').get<string>('cursorColorLightTheme'),
  },
  borderStyle: 'solid',
  borderWidth: '1px',
});
