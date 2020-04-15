import FSManager from "./FSManager";
import { asyncForEach, osRootPath} from "../utils";
import {sep, join, } from 'path';

export async function saveProjectFiles(codioWorkspacePath, files: Array<string>) {
  try {
    await saveFolderIfDoesNotExist(codioWorkspacePath);
    const filesWithSplittedPath: Array<string[]> = files.map(file => file.split(sep));
    await saveFiles(codioWorkspacePath, filesWithSplittedPath);
  } catch (e) {
    console.log('save project files error', e);
  }
}

//@TODO: windows support
export function reduceToRoot(files: string[][], rootPath = osRootPath) : {files: string[], rootPath: string}{
    if (!files || files[0].length === 0) {
      throw new Error('There is no common root, something is wrong');
    }
    const currentFolder = files[0][0];
    const isSame = files.every(file => file[0] === currentFolder);
    if (!isSame) {
      return {files: files.map(file => join(...file)), rootPath};
    } else {
      return reduceToRoot(files.map(file => file.slice(1)), join(rootPath, currentFolder) );
    }
}

async function saveFiles(root: string, filesWithSplittedPath: string[][]) {
  await asyncForEach(filesWithSplittedPath, async filePathSplitted => {
    let currentFolder = root;
    await asyncForEach(filePathSplitted, async (partOfPath, idx) => {
      if (idx === filePathSplitted.length - 1) {
        FSManager.saveFile(join(currentFolder, filePathSplitted[idx]), '');
      } else {
        currentFolder = join(currentFolder, partOfPath);
        await saveFolderIfDoesNotExist(currentFolder);
      }
    });
  });
}


const fs = require('fs').promises;
async function ensureDir (dirpath) {
  try {
    await fs.mkdir(dirpath);
  } catch (err) {
    if (err.code !== 'EEXIST') { console.log('Dir Exists!!!'); }
  }
}

async function saveFolderIfDoesNotExist(path) {
  try {
    await ensureDir(path);
    console.log('Directory created', path);
  } catch (err) {
    console.error('ensure dir error', err);
  }
}