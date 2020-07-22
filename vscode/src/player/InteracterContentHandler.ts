import { Uri, workspace, window } from 'vscode';
import ShadowDocument from '../editor/frame/ShadowDocument';
import { getTextEditor } from '../utils';
import { readFileSync } from 'fs';

const guessRegex = new RegExp(/(\/\/\s*your guess:?)(.*)/gi);
const codeGoesHereRegex = new RegExp(/(\/\/\s*your code goes here:?)([\s\S]+?)(\/\/\s*end)/gi);

type FrameInteracterContent = Array<{ uri: Uri; codeGoesHereMatches: Array<any>; guessMatches: Array<any> }>;
export function getInteracterContent(initialFrame: CodioFrame): FrameInteracterContent {
  return initialFrame.map((codioFile) => {
    const { codeGoesHereMatches, guessMatches } = getInteracterContentFromFileText(codioFile.document.text);
    return {
      uri: codioFile.uri,
      codeGoesHereMatches,
      guessMatches,
    };
  });
}

export function addInteracterContentToFrame(frame: CodioFrame, frameInteracterContent: FrameInteracterContent) {
  return frame.map((codioFile) => {
    const fileInteracterContent = frameInteracterContent.find(
      (interacterContentFile) => interacterContentFile.uri.path === codioFile.uri.path,
    );
    const textWithInteracterContent = addInteracterContentToFileText(codioFile.document.text, fileInteracterContent);
    return {
      ...codioFile,
      document: new ShadowDocument(textWithInteracterContent),
    };
  });
}

export function getInteracterContentFromFileText(text) {
  const guessMatches = [];
  const codeGoesHereMatches = [];
  text.replace(guessRegex, (_, p1, p2) => guessMatches.push({ p1, p2 }));
  text.replace(codeGoesHereRegex, (_, p1, p2, p3) => codeGoesHereMatches.push({ p1, p2, p3 }));
  console.log('interacter content:', { text, guessMatches, codeGoesHereMatches });
  return { guessMatches, codeGoesHereMatches };
}

export function addInteracterContentToFileText(text, { guessMatches, codeGoesHereMatches }) {
  const textWithInteracterGuess = text.replace(guessRegex, (m, p) => {
    const { p1, p2 } = guessMatches.shift();
    return `${p1}${p2}`;
  });

  const textWithInteracterCode = textWithInteracterGuess.replace(codeGoesHereRegex, (m, p) => {
    const { p1, p2, p3 } = codeGoesHereMatches.shift();
    return `${p1}${p2}${p3}`;
  });
  return textWithInteracterCode;
}

export function getCurrentFrameWithInteracterContent(initialFrame: CodioFrame): CodioFrame {
  return initialFrame.map((codioFile) => {
    let currentText;
    const textEditor = getTextEditor(codioFile.uri.path);
    if (textEditor) {
      currentText = textEditor.document.getText();
    } else {
      currentText = readFileSync(codioFile.uri.fsPath).toString();
    }
    return {
      ...codioFile,
      document: new ShadowDocument(currentText),
    };
  });
}
