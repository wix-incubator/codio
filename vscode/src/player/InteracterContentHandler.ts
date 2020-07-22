import { Uri, workspace, window } from "vscode";
import { CodioFrame } from "../types/module";

const guessRegex = new RegExp(/(\/\/\s*your guess:?)(.*)/gi);
const codeGoesHereRegex = new RegExp(/(\/\/\s*your code goes here:?)([\s\S]*)(\/\/\s*end)/gi);

type FrameInteracterContent = Array<any>;
export function getInteracterContent(initialFrame: CodioFrame) : FrameInteracterContent{
    const currentFrameText = workspace.textDocuments.filter(doc => doc.uri.path === file.uri.path).map(document => {
            return document.getText();
        });
    const interacterContent = currentFrameText.map(file => {
        const guessMatches = [];
        const codeGoesHereMatches = [];
        text.replace(guessRegex, (_, p1, p2) => guessMatches.push({p1, p2}));
        text.replace(codeGoesHereRegex, (_, p1, p2, p3) => codeGoesHereMatches.push({p1, p2, p3}));
        console.log("interacter content:", {guessMatches, codeGoesHereMatches});
        return {guessMatches, codeGoesHereMatches};
    });
    return interacterContent;
}

export function addInteracterContentToFrame(frame: CodioFrame, interacterContent {guessMatches, codeGoesHereMatches}) {
    return frame.map.toString(file => {
        const frameWithInteracterGuess = frame.replace(guessRegex, (m, p) => {
            const {p1, p2} = guessMatches.shift();
            return `${p1}${p2}`;
          });

        const frameWithInteracterCode = frameWithInteracterGuess.replace(codeGoesHereRegex, (m, p) => {
            const {p1, p2, p3} = codeGoesHereMatches.shift();
            return `${p1}${p2}${p3}`;
        });
        return frameWithInteracterCode;
    });

}
