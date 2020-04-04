import {mkdir, readFile, unlink, readdir, exists, promiseExec, writeFile} from '../utils';
import * as vscode from 'vscode';
import { saveProjectFiles, reduceToRoot } from './saveProjectFiles';
const os = require("os");
const fs = require("fs");
const { join } = require('path');
const homedir = require('os').homedir();
const onCodiosChangedSubscribers = [];

const TUTORIAL_META_FILE = 'meta.json';
const CODIO_META_FILE = 'meta.json';
const CODIO_CONTENT_FILE = 'codio.json';
const CODIO_WORKSPACE_FOLDER = 'workspace';
const EXTENSION_FOLDER = join(homedir,"/Library/codio/");
const CREDENTIALS_FILE = join(EXTENSION_FOLDER, "/cred.json");

export default class FSManager {
    extensionFolder: string;
    tempFolder: string;
    codiosFolder: string;
    tutorialsFolder: string;

    onCodiosChanged(func: Function) {
        onCodiosChangedSubscribers.push(func);
    }

    codioPath(codioId) {
        return join(this.codiosFolder, codioId);
    }

    tutorialPath(tutorialId) {
        return join(this.tutorialsFolder, tutorialId);
    }

    constructor() {
        const userOS = os.platform();
        this.tempFolder = os.tmpdir();
        if (userOS === "darwin") {
            this.extensionFolder = EXTENSION_FOLDER;
        } else if (userOS === "win32") {
            this.extensionFolder = join(homedir, "/codio/");
        }
        this.codiosFolder = join(this.extensionFolder, "/codios");
        this.tutorialsFolder = join(this.extensionFolder, "/tutorials");

    }

    static async saveCredentials(email, cookie = '', uid = '') {
        try {
            this.saveFile(CREDENTIALS_FILE, JSON.stringify({email, cookie, uid}));
        } catch(e) {
            console.log("save credentials error:", e);
        }
    }

    static async loadCredentials() {
        try {
            const credentials = await readFile(CREDENTIALS_FILE);
            return JSON.parse(credentials);
        } catch(e) {
            console.log("save credentials error:", e);
        }
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
        return join(codioPath, '/codio.json');
    }

    static audioPath(codioPath) {
        return join(codioPath, '/audio.mp3');
    }

    static workspacePath(codioPath) {
        return join(codioPath, '/workspace');
    }

    static codioPrefix(fileName) {
        return `codio.${fileName}`;
    }

    static async loadTimeline(codioPath) {
        const timelineContent = await readFile(this.timelinePath(codioPath));
        const parsedTimeline = JSON.parse(timelineContent);
        return parsedTimeline;
    }
    static toRelativePath(uri: vscode.Uri, rootPath: string) {
        const pathSplit = uri.path.split('/');
        const rootPathSplit = rootPath.split('/');
        const relativePath = pathSplit.slice(rootPathSplit.length).join('/');
        return relativePath;
    }

    static addCodioPreifx(path: string) {
        const splitPath =  path.split('/');
        splitPath[splitPath.length -1] = `codio.${splitPath[splitPath.length -1]}`;
        const codifiedPath = splitPath.join('/');
        return codifiedPath;
    }

    static codifyPath(path: vscode.Uri, rootPath: string) : string {
        const relativePath = this.toRelativePath(path, rootPath);
        const codifiedPath = this.addCodioPreifx(relativePath);
        return codifiedPath;
    }

    static async saveRecordingToFile(codioContent: Object, metaData: Object, files: Array<any>, codioPath: string, destinationFolder: vscode.Uri | undefined) {
        const codioContentJson = JSON.stringify(codioContent);
        const metaDataJson = JSON.stringify(metaData);
        FSManager.saveFile(join(codioPath, CODIO_CONTENT_FILE), codioContentJson);
        FSManager.saveFile(join(codioPath, CODIO_META_FILE), metaDataJson);
        const codioWorkspaceFolderPath = join(codioPath, CODIO_WORKSPACE_FOLDER);
        await saveProjectFiles(codioWorkspaceFolderPath, files);
        if (destinationFolder) {
            this.zip(codioPath, destinationFolder.fsPath);
        }
        onCodiosChangedSubscribers.forEach(func => func());
    }

    static normalizeFilesPath(fullPathFiles) {
        if (fullPathFiles.length > 1) {
            const splitFiles = fullPathFiles.map(file => file.split('/').slice(1));
            const {rootPath, files} = reduceToRoot(splitFiles);
            const filesWithCodioPrefix = files.map(file => [...file.slice(0, -1), this.codioPrefix(file[file.length - 1])]);
            return {rootPath, files: filesWithCodioPrefix};
        } else {
            const fullPathSplit = fullPathFiles[0].split('/');
            const rootPath = fullPathSplit.slice(0, -1).join('/');
            const file = fullPathSplit[fullPathSplit.length-1];
            const fileWithCodioPrefix = this.codioPrefix(file);
            return { rootPath, files: [fileWithCodioPrefix]};
        }
    }

    static toFullPath(codioPath, filePath) {
        return join(codioPath, filePath);
    }

    async folderNameExists(folderName): Promise<boolean> {
        return await exists(`${this.extensionFolder}/${folderName}`);
    }

    async createExtensionFolders() {
        try {
            const extensionFolderExists = await exists(this.extensionFolder);
            if (!extensionFolderExists) {
                await mkdir(this.extensionFolder);
            }
            const codiosFolderExists = await exists(this.codiosFolder);
            if (!codiosFolderExists) {
                await mkdir(this.codiosFolder);
            }
            const tutorialsFolderExists = await exists(this.tutorialsFolder);
            if (!tutorialsFolderExists) {
                await mkdir(this.tutorialsFolder);
            }
        } catch(e) {
            console.log('Problem creating your tutorial folder', e);
        }
    }

    async createCodioFolder(folderName) {
        try {
            const path = join(this.codiosFolder, folderName);
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
            await promiseExec(`cd ${srcPath} && zip -r ${distPath}.codio .`);
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

    async unzipTutorial(tutorialId) {
        try {
            await mkdir(join(this.tutorialsFolder, tutorialId));
            await promiseExec(`unzip ${join(this.tutorialsFolder, tutorialId)}.zip -d ${join(this.tutorialsFolder, tutorialId)}`);
        } catch(e) {
            console.log(`unzipping tutorial with id: ${tutorialId} failed`, e);
        }
    }

    async deleteFilesInCodio(codioId) {
        const path = join(this.codiosFolder, codioId);
        const files = await readdir(path);
        // currently I am assuming there won't be directories inside the directory
        await Promise.all(files.map(f => unlink(join(path, f))));
        return path;
    }


    async getCodiosMetadata() : Promise<Array<any>> {
        try {
            let codiosMetaData = [];
            const folderContents = await readdir(this.codiosFolder);
            const directories = folderContents.filter(file => fs.statSync(join(this.codiosFolder, file)).isDirectory());
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
            const metaData = await readFile(join(this.codiosFolder, codioId, CODIO_META_FILE));
            return JSON.parse(metaData);
        } catch(e) {
            console.log(`Problem getting codio ${codioId} meta data`, e);
        }
    }

    async getTutorialMetaDataContent(tutorialId) {
        try {
            const metaData = await readFile(join(this.tutorialsFolder, tutorialId, TUTORIAL_META_FILE));
            return JSON.parse(metaData);
        } catch(e) {
            console.log(`Problem getting tutorial ${tutorialId} meta data`, e);
        }
    }

    async getTutorialsMetadata() : Promise<Array<any>> {
        try {
            let tutorialsMetadata = [];
            const folderContents = await readdir(this.tutorialsFolder);
            const directories = folderContents.filter(file => fs.statSync(join(this.tutorialsFolder, file)).isDirectory());
            await Promise.all(directories.map(async dir => {
                const metaData = await this.getTutorialMetaDataContent(dir);
                tutorialsMetadata.push({...metaData, id: dir});
            }));
            return tutorialsMetadata;
        } catch(e) {
            console.log(`getTutorialsMetadata failed`, e);
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

    async chooseTutorial() {
       return this.choose(this.getTutorialsMetadata.bind(this));
    }

    async createTutorial(tutorialName) {
        const uuid = require('uuid');
        const tutorialId = uuid.v4();
        const tutorialInitialMetadata = {name: tutorialName, codios: [], id: tutorialId};
        const tutorialPath = join(this.tutorialsFolder, tutorialId);
        await mkdir(tutorialPath);

        FSManager.saveFile(join(tutorialPath, TUTORIAL_META_FILE), JSON.stringify(tutorialInitialMetadata));
        onCodiosChangedSubscribers.forEach(func => func());
    }

    async addCodioToTutorial(tutorialId, codioId) {
        const tutorialPath = join(this.tutorialsFolder, tutorialId);
        const metaDataRaw = await readFile(join(tutorialPath, TUTORIAL_META_FILE));
        const metaData = JSON.parse(metaDataRaw);
        metaData.codios.push({id: codioId});
        FSManager.saveFile(join(tutorialPath, TUTORIAL_META_FILE), JSON.stringify(metaData));
    }

    async removeCodioFromTutorial(tutorialId, codioId) {
        const tutorialPath = join(this.tutorialsFolder, tutorialId);
        const metaDataRaw = await readFile(join(tutorialPath, TUTORIAL_META_FILE));
        const metaData = JSON.parse(metaDataRaw);
        metaData.codios = metaData.codios.filter(codio => codio.id !== codioId);
        FSManager.saveFile(join(tutorialPath, TUTORIAL_META_FILE), JSON.stringify(metaData));
    }
}