import FSManager from './FSManager';
import { asyncForEach, uriSeperator } from '../utils';
import { join } from 'path';

export async function saveProjectFiles(codioWorkspacePath, files: Array<string>) {
  try {
    await saveFolderIfDoesNotExist(codioWorkspacePath);
    const filesWithSplittedPath: Array<string[]> = files.map((file) => file.split(uriSeperator));
    await saveFiles(codioWorkspacePath, filesWithSplittedPath);
  } catch (e) {
    console.log('save project files error', e);
  }
}

//@TODO: windows support
export function reduceToRoot(files: string[][], rootPath = uriSeperator): { files: string[]; rootPath: string } {
  if (!files || files[0].length === 0) {
    throw new Error('There is no common root, something is wrong');
  }
  console.log('reduceToRoot', { files, rootPath });
  const currentFolder = files[0][0];
  const isSame = files.every((file) => file[0] === currentFolder);
  if (!isSame) {
    return { files: files.map((file) => file.join(uriSeperator)), rootPath };
  } else {
    return reduceToRoot(
      files.map((file) => file.slice(1)),
      join(rootPath, currentFolder),
    );
  }
}

async function saveFiles(root: string, filesWithSplittedPath: string[][]) {
  await asyncForEach(filesWithSplittedPath, async (filePathSplitted) => {
    let currentFolder = root;
    await asyncForEach(filePathSplitted, async (partOfPath, idx) => {
      if (idx === filePathSplitted.length - 1) {
        await FSManager.saveFile(join(currentFolder, filePathSplitted[idx]), '');
      } else {
        currentFolder = join(currentFolder, partOfPath);
        await saveFolderIfDoesNotExist(currentFolder);
      }
    });
  });
}

const fs = require('fs').promises;
export async function ensureDir(dirpath) {
  try {
    await fs.mkdir(dirpath);
  } catch (err) {
    if (err.code !== 'EEXIST') {
      console.log('Dir Exists!!!');
    }
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
