import * as vscode from 'vscode';
import { zip, unzip } from 'cross-zip';
import { mkdir, readFile, unlink, readdir, exists, writeFile, uriSeperator, isWindows, promiseExec } from '../utils';
import { saveProjectFiles, reduceToRoot } from './saveProjectFiles';
import * as os from 'os';
import * as fs from 'fs';
import { join } from 'path';
import { v4 as uuid } from 'uuid';
import { getWorkspaceRootAndCodiosFolderIfExists } from './workspace';

const homedir = require('os').homedir();
const userOS = os.platform();
const onCodiosChangedSubscribers = [];
const EXTENSION_FOLDER = userOS === 'darwin' ? join(homedir, 'Library', 'codio') : join(homedir, 'codio');
const codiosFolder = join(EXTENSION_FOLDER, 'codios');

const CODIO_META_FILE = 'meta.json';
const CODIO_CONTENT_FILE = 'codio.json';
const CODIO_WORKSPACE_FOLDER = 'workspace';

export default class FSManager {
  tempFolder: string;

  onCodiosChanged(func: Function) {
    onCodiosChangedSubscribers.push(func);
  }

  codioPath(codioId) {
    return join(codiosFolder, codioId);
  }

  constructor() {
    this.tempFolder = os.tmpdir();
  }

  static async saveFile(path, content) {
    try {
      await writeFile(path, content);
      console.log('The file was saved!', path);
    } catch (e) {
      console.log('save file fail', e);
    }
  }

  static timelinePath(codioPath) {
    return join(codioPath, 'codio.json');
  }

  static audioPath(codioPath) {
    return join(codioPath, 'audio.mp3');
  }

  static workspacePath(codioPath) {
    return join(codioPath, 'workspace');
  }

  static async loadTimeline(codioPath) {
    const timelineContent = await readFile(this.timelinePath(codioPath));
    const parsedTimeline = JSON.parse(timelineContent.toString());
    return parsedTimeline;
  }

  static toRelativePath(uri: vscode.Uri, rootPath: string) {
    const pathSplit = uri.path.split(uriSeperator);
    const rootPathSplit = rootPath.split(uriSeperator);
    const relativePath = pathSplit.slice(rootPathSplit.length).join(uriSeperator);
    return relativePath;
  }

  static async saveRecordingToFile(
    codioContent: Object,
    metaData: Object,
    files: Array<string>,
    codioPath: string,
    destinationFolder?: vscode.Uri,
  ) {
    const codioContentJson = JSON.stringify(codioContent);
    const metaDataJson = JSON.stringify(metaData);
    await this.saveFile(join(codioPath, CODIO_CONTENT_FILE), codioContentJson);
    await this.saveFile(join(codioPath, CODIO_META_FILE), metaDataJson);
    const codioWorkspaceFolderPath = join(codioPath, CODIO_WORKSPACE_FOLDER);
    await saveProjectFiles(codioWorkspaceFolderPath, files);
    if (destinationFolder) {
      await this.zip(codioPath, destinationFolder.fsPath);
    } else {
      fs.renameSync(codioPath, join(codiosFolder, uuid()));
    }
    onCodiosChangedSubscribers.forEach((func) => func());
  }

  static normalizeFilesPath(fullPathFiles: Array<string>, root?: vscode.Uri): { rootPath: string; files: string[] } {
    // In Windows, case doesn't matter in file names, and some events return files with different cases.
    // That is not the same in Linux for example, where case does matter. The reduceToRoot algorithm is case sensetive,
    // which is why we are normalizing for windows here
    const filesWithNormalizedCase = fullPathFiles.map((file) => (isWindows ? file.toLowerCase() : file));
    if (root) {
      const normalizedFiles = filesWithNormalizedCase.map((path) =>
        this.toRelativePath(vscode.Uri.file(path), root.path),
      );
      return { rootPath: root.path, files: normalizedFiles };
    } else if (filesWithNormalizedCase.length > 1) {
      console.log({ uriSeperator });
      const splitFiles = filesWithNormalizedCase.map((file) => file.split(uriSeperator).slice(1));
      const { rootPath, files } = reduceToRoot(splitFiles);
      return { rootPath, files };
    } else {
      const fullPathSplit = filesWithNormalizedCase[0].split(uriSeperator);
      const rootPath = fullPathSplit.slice(0, -1).join(uriSeperator);
      const file = fullPathSplit[fullPathSplit.length - 1];
      return { rootPath: rootPath, files: [file] };
    }
  }

  static toFullPath(codioPath, filePath) {
    return join(codioPath, filePath);
  }

  async folderNameExists(folderName): Promise<boolean> {
    return await exists(join(EXTENSION_FOLDER, folderName));
  }

  async createExtensionFolders() {
    try {
      const extensionFolderExists = await exists(EXTENSION_FOLDER);
      if (!extensionFolderExists) {
        await mkdir(EXTENSION_FOLDER);
      }
      const codiosFolderExists = await exists(codiosFolder);
      if (!codiosFolderExists) {
        await mkdir(codiosFolder);
      }
    } catch (e) {
      console.log('Problem creating your extension folders', e);
    }
  }

  async createCodioFolder(folderName) {
    try {
      const path = join(codiosFolder, folderName);
      await mkdir(path);
      return path;
    } catch (e) {
      console.log('Problem creating folder', e);
    }
  }

  async createTempCodioFolder(codioId) {
    try {
      const path = join(this.tempFolder, codioId);
      await mkdir(path);
      return path;
    } catch (e) {
      console.log('Problem creating folder', e);
    }
  }

  getCodioUnzipped(uri: vscode.Uri) {
    if (fs.lstatSync(uri.fsPath).isDirectory()) {
      return uri.fsPath;
    } else {
      return this.unzipCodio(uri.fsPath);
    }
  }

  static async zip(srcPath, distPath) {
    try {
      if (isWindows) {
        await new Promise((res, rej) => zip(srcPath, distPath, (error: Error) => (error ? rej(error) : res())));
      } else {
        await promiseExec(`cd ${srcPath} && zip -r ${distPath} .`);
      }
      return `${distPath}`;
    } catch (e) {
      console.log(`zip for folder ${srcPath} failed`, e);
    }
  }

  async unzipCodio(srcPath) {
    const uuid = require('uuid');
    const codioId = uuid.v4();
    const codioTempFolder = join(this.tempFolder, codioId);
    try {
      // await promiseExec(`unzip ${srcPath} -d ${codioTempFolder}`);
      await new Promise((res, rej) => unzip(srcPath, codioTempFolder, (error: Error) => (error ? rej(error) : res())));
      return codioTempFolder;
    } catch (e) {
      console.log(`unzipping codio with path: ${srcPath} failed`, e);
    }
  }

  async deleteFilesInCodio(codioId) {
    const path = join(codiosFolder, codioId);
    const files = await readdir(path);
    // currently I am assuming there won't be directories inside the directory
    await Promise.all(files.map((f) => unlink(join(path, f))));
    return path;
  }

  async getCodiosUnzippedFromCodioFolder(folder) {
    const folderContents = await readdir(folder);
    return await Promise.all(
      folderContents
        .map((file) => {
          const fullPath = join(folder, file);
          if (fs.statSync(fullPath).isDirectory()) {
            return fullPath;
          } else if (file.endsWith('.codio')) {
            return this.getCodioUnzipped(vscode.Uri.file(fullPath));
          }
        })
        .filter((folder) => !!folder),
    );
  }

  async getCodiosMetadata(folder = codiosFolder, workspaceRoot?: vscode.Uri): Promise<Array<any>> {
    try {
      const codiosMetaData = [];
      const directories = await this.getCodiosUnzippedFromCodioFolder(folder);
      await Promise.all(
        directories.map(async (dir) => {
          const metaData = await this.getCodioMetaDataContent(dir);
          const codioUri = vscode.Uri.file(dir);
          codiosMetaData.push({ ...metaData, uri: codioUri, workspaceRoot });
        }),
      );
      return codiosMetaData;
    } catch (e) {
      console.log(`getCodiosMetaData failed`, e);
    }
  }

  async getAllCodiosMetadata() {
    const workspaceFolders = getWorkspaceRootAndCodiosFolderIfExists();
    const codioWorkspaceCodios = workspaceFolders
      ? await this.getCodiosMetadata(workspaceFolders.workspaceCodiosFolder, workspaceFolders.workspaceRootUri)
      : [];
    const libraryCodios = await this.getCodiosMetadata();
    const allCodios = [...codioWorkspaceCodios, ...libraryCodios];
    return allCodios;
  }

  async getCodioMetaDataContent(codioFolderPath) {
    try {
      const metaData = await readFile(join(codioFolderPath, CODIO_META_FILE));
      return JSON.parse(metaData.toString());
    } catch (e) {
      console.log(`Problem getting codio ${codioFolderPath} meta data`, e);
    }
  }

  async choose(codiosMetadata): Promise<{ path: string; workspaceRoot: vscode.Uri } | undefined> {
    let unlock;
    let itemSelected;
    const quickPickItems = codiosMetadata.map((item) => ({
      label: item.name,
      details: { path: item.uri.fsPath, workspaceRoot: item.workspaceRoot },
    }));
    const quickPick = vscode.window.createQuickPick();
    quickPick.items = quickPickItems;
    quickPick.onDidChangeSelection((e) => {
      itemSelected = e[0];
      unlock();
      quickPick.hide();
    });
    quickPick.onDidHide(() => {
      quickPick.dispose();
      unlock();
    });
    quickPick.show();
    await new Promise((res) => (unlock = res));
    console.log('itemSelected', itemSelected);
    if (itemSelected) {
      return itemSelected.details; // details is the codio path. This due to vscode api being weird here, refactor needed...
    } else {
      return undefined;
    }
  }

  async chooseCodio(): Promise<{ path: string; workspaceRoot?: vscode.Uri } | undefined> {
    const codios = await this.getAllCodiosMetadata();
    return this.choose(codios);
  }
}
