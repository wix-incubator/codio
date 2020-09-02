import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand('catCoding.start', () => {
      // Create and show panel
    }),
  );
}

export const showQuiz = (quiz: Quiz, step: TutorialStepWithId) => {
  const panel = vscode.window.createWebviewPanel('quiz', step.name, vscode.ViewColumn.One, {
    enableScripts: true,
    enableCommandUris: true,
  });

  panel.webview.html = getWebviewContent(quiz);

  panel.webview.onDidReceiveMessage((message) => {
    //   if (Number(message.selectedAnswer) === Number(quiz.correct)) {
    //     markStepDone(step.id)
    //     panel.webview.postMessage({isCorrect: '', responseMessage:, nextStep: step)
    // } else {
    //   vscode.window.showInformationMessage('not correct!');
    // }
  });
};

function getWebviewContent(quiz: Quiz) {
  return `<!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8" />
      <style></style>
    </head>
    <style>
    * {
        font-size: x-large;
    }
    </style>
    <body id="preview" >
      <form onsubmit="onSubmit()">
        <h1 data-line-start="0" data-line-end="1">Answer the following:</h1>
        ${quiz
          .map((task) => {
            return `<h5 data-line-start="1" data-line-end="2">${task.question}</h5>
        <p data-line-start="2" data-line-end="4">${task.questionDescription}</p>
        <p data-line-start="9" data-line-end="16">
          ${task.answers
            .map((ans, idx) => {
              return `
          <input type="radio" name="answer" value=${idx}/>
          ${typeof ans === 'string' ? ans : ans.answer}
          <br/>
          `;
            })
            .join(' ')}`;
          })
          .join(' ')}
        </p>
        <input type="submit" value="Submit" />
      </form>
    </body>
  </html>`;
}
