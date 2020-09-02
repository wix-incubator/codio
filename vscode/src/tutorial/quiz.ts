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
    enableCommandUris: true
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
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Quiz</title>
</head>
<body>
    <form onsubmit="onSubmit()">
        ${quiz.map(task => {
            return `<h1>${task.question}</h1>
            ${task.answers.map((ans, idx) => {
                return `
                <input type="radio" id="ans${idx}" name="answer" value="${idx}">
                <label for="ans${idx}">${typeof ans === 'string' ? ans : ans.answer}</label><br>    
                `
            }).join(" ")}`
        }).join(" ")}
        <input type="submit" value="Submit">
    </form>

    <script>
    const vscode = acquireVsCodeApi();
    function onSubmit(e) {

        vscode.postMessage({
            selectedAnswer: document.querySelector('input[name="answer"]:checked').value
        })
    }

    window.addEventListener('message', event => {
        const message = event.data; // The JSON data our extension sent
        switch (message.quizResult) {
            case 'success':

                break;
        }
    });
</script>
</body>
</html>`;
}
