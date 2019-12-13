import FSManager from "./FSManager";
import { asyncForEach } from "../utils";
const { join } = require('path');

export async function saveProjectFiles(codioWorkspacePath, files) {
  try {
    await saveFolderIfDoesNotExist(codioWorkspacePath);
    if (files.length > 1) {
      await saveFiles(codioWorkspacePath, files);
    } else {
      await FSManager.saveFile(join(codioWorkspacePath, files[0]), '');
    }
  } catch (e) {
    console.log('save project files error', e);
  }
}

export function reduceToRoot(files, rootPath = '/') {
    if (!files || files[0].length === 0) {
      throw new Error('There is no common root, something is wrong');
    }
    const currentFolder = files[0][0]
    const isSame = files.every(file => file[0] === currentFolder);
    if (!isSame) {
      return {files, rootPath};
    } else {
      return reduceToRoot(files.map(file => file.slice(1)), join(rootPath, currentFolder) );
    }
}

async function saveFiles(root, files) {
  files.map(file => {
    let currentFolder = root;
    asyncForEach(file, async (path, idx) => {
      if (idx === file.length - 1) {
      FSManager.saveFile(join(currentFolder, file[idx]), '');
      } else {
        currentFolder = join(currentFolder, path);
        await saveFolderIfDoesNotExist(currentFolder);
      }
    });
  });
}


const fs = require('fs').promises;
async function ensureDir (dirpath) {
  try {
    await fs.mkdir(dirpath)
  } catch (err) {
    if (err.code !== 'EEXIST') console.log('Dir Exists!!!');
  }
}

async function saveFolderIfDoesNotExist(path) {
  try {
    await ensureDir(path)
    console.log('Directory created', path)
  } catch (err) {
    console.error('ensure dir errrrr', err)
  }
}