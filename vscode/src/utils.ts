import * as vscode from 'vscode';
import { exec } from 'child_process';
import * as fs from 'fs';
import * as util from 'util';
import { platform } from 'os';
//filesystem
export const createReadStream = fs.createReadStream;
export const promiseExec = util.promisify(exec);
export const readFile = util.promisify(fs.readFile);
export const writeFile = util.promisify(fs.writeFile);
export const readdir = util.promisify(fs.readdir);
export const unlink = util.promisify(fs.unlink);
export const mkdir = util.promisify(fs.mkdir);
export const exists = util.promisify(fs.exists);

export const isWindows = platform() === 'win32';
export const isMacOs = platform() === 'darwin';

export const uriSeperator = '/';
//ffmpeg
export const checkForFfmpeg = async () => {
  return new Promise((res) => {
    exec('ffmpeg -h', (error) => {
      res(!error);
    });
  });
};

//editor
export async function overrideEditorText(editor: vscode.TextEditor, newText: string) {
  const invalidRange = new vscode.Range(0, 0, editor.document.lineCount /*intentionally missing the '-1' */, 0);
  const fullRange = editor.document.validateRange(invalidRange);
  await editor.edit((edit) => edit.replace(fullRange, newText));
}

export function getTextEditor(path: string): vscode.TextEditor {
  return vscode.window.visibleTextEditors.find((editor) => editor.document.uri.path === path);
}
//strings
export function replaceRange(s: string, start: number, end: number, substitute: string): string {
  return s.substring(0, start) + substitute + s.substring(end);
}

export function nthIndex(str, pat, n): number {
  const L = str.length;
  let i = -1;
  while (n-- && i++ < L) {
    i = str.indexOf(pat, i);
    if (i < 0) {
      break;
    }
  }
  return i;
}

export async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

/**
 * Check if given object is a tree item.
 * @param obj Object to check properties on.
 * @returns Return true if given object is a tree item; false otherwise.
 */
export function isTreeItem(obj = {}): boolean {
  return 'contextValue' in obj || 'command' in obj;
}
