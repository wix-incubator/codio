import {mkdir, readFile, unlink, readdir, exists, promiseExec, writeFile} from '../utils';
import * as vscode from 'vscode';
import { saveProjectFiles, reduceToRoot } from './saveProjectFiles';
import * as os from "os";
import * as fs from "fs";
import { join, sep } from 'path';
import { v4 as uuid } from 'uuid';

const homedir = require('os').homedir();
const userOS = os.platform();
const onCodiosChangedSubscribers = [];
const EXTENSION_FOLDER = userOS === "darwin" ? join(homedir,"Library", "codio") : join(homedir, "codio");
const codiosFolder = join(EXTENSION_FOLDER, "codios");

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
            console.log("The file was saved!", path);
        } catch(e) {
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
        const pathSplit = uri.path.split(sep);
        const rootPathSplit = rootPath.split(sep);
        const relativePath = pathSplit.slice(rootPathSplit.length).join(sep);
        return relativePath;
    }

    static async saveRecordingToFile(codioContent: Object, metaData: Object, files: Array<string>, codioPath: string, destinationFolder?: vscode.Uri) {
        const codioContentJson = JSON.stringify(codioContent);
        const metaDataJson = JSON.stringify(metaData);
        this.saveFile(join(codioPath, CODIO_CONTENT_FILE), codioContentJson);
        this.saveFile(join(codioPath, CODIO_META_FILE), metaDataJson);
        const codioWorkspaceFolderPath = join(codioPath, CODIO_WORKSPACE_FOLDER);
        await saveProjectFiles(codioWorkspaceFolderPath, files);
        if (destinationFolder) {
            this.zip(codioPath, destinationFolder.fsPath);
        } else {
            fs.renameSync(codioPath, join(codiosFolder, uuid()));
        }
        onCodiosChangedSubscribers.forEach(func => func());
    }

    static normalizeFilesPath(fullPathFiles: Array<string> , root?: vscode.Uri) : {rootPath: string, files: string[]} {
        if (root) {
            const normalizedFiles = fullPathFiles.map(fsPath => this.toRelativePath(vscode.Uri.file(fsPath), root.fsPath));
            return { rootPath: root.fsPath, files: normalizedFiles};
        } else if (fullPathFiles.length > 1) {
            const splitFiles = fullPathFiles.map(file => file.split(sep).slice(1));
            const {rootPath, files} = reduceToRoot(splitFiles);
            return {rootPath, files};
        } else {
            const fullPathSplit = fullPathFiles[0].split(sep);
            const rootPath = fullPathSplit.slice(0, -1).join(sep);
            const file = fullPathSplit[fullPathSplit.length-1];
            return { rootPath: rootPath, files: [file]};
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
        } catch(e) {
            console.log('Problem creating your extension folders', e);
        }
    }

    async createCodioFolder(folderName) {
        try {
            const path = join(codiosFolder, folderName);
            await mkdir(path);
            return path;
        }  catch(e) {
            console.log('Problem creating folder', e);
        }
    }

    async createTempCodioFolder(codioId) {
        try {
            const path = join(this.tempFolder, codioId);
            await mkdir(path);
            return path;
        }  catch(e) {
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
            await promiseExec(`cd ${srcPath} && zip -r ${distPath} .`);
            return `${distPath}.zip`;
        } catch(e) {
            console.log(`zip for folder ${srcPath} failed`, e);
        }
    }

    async unzipCodio(srcPath) {
        const uuid = require('uuid');
        const codioId = uuid.v4();
        const codioTempFolder = join(this.tempFolder, codioId);
        try {
            await promiseExec(`unzip ${srcPath} -d ${codioTempFolder}`);
            return codioTempFolder;
        } catch(e) {
            console.log(`unzipping codio with path: ${srcPath} failed`, e);
        }
    }

    async deleteFilesInCodio(codioId) {
        const path = join(codiosFolder, codioId);
        const files = await readdir(path);
        // currently I am assuming there won't be directories inside the directory
        await Promise.all(files.map(f => unlink(join(path, f))));
        return path;
    }


    async getCodiosMetadata() : Promise<Array<any>> {
        try {
            let codiosMetaData = [];
            const folderContents = await readdir(codiosFolder);
            const directories = folderContents.filter(file => fs.statSync(join(codiosFolder, file)).isDirectory());
            await Promise.all(directories.map(async dir => {
                const metaData = await this.getCodioMetaDataContent(dir);
                codiosMetaData.push({...metaData, id: dir});
            }));
            return codiosMetaData;
        } catch(e) {
            console.log(`getCodiosMetaData failed`, e);
        }
    }

    async getCodioMetaDataContent(codioId) {
        try {
            const metaData = await readFile(join(codiosFolder, codioId, CODIO_META_FILE));
            return JSON.parse(metaData.toString());
        } catch(e) {
            console.log(`Problem getting codio ${codioId} meta data`, e);
        }
    }

    async choose(getMetaDataCallback) {
        let unlock;
        let itemSelected;
        const metaData = await getMetaDataCallback();
        const quickPickItems = metaData.map(item => ({label: item.name, description: item.id}));
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
        await new Promise(res => unlock = res);
        console.log('itemSelected', itemSelected);
        if (itemSelected) {
            return itemSelected.description; // description is the codio id. This due to vscode api being weird here, refactor needed...
        } else {
            return undefined;
        }
    }

    async chooseCodio() {
        return this.choose(this.getCodiosMetadata.bind(this));
    }
}