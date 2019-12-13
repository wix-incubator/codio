import { spawn } from 'child_process';
import { window } from 'vscode';

export async function interacterExecute() {
    const document = window.activeTextEditor.document;
    const outputChannel = window.createOutputChannel('codio');
    const uri = document.uri;
    await document.save();
    outputChannel.show(true);
    const nodeExecution = spawn(`node`,  [`${uri.fsPath}`]);
    nodeExecution.stdout.on('data', function (data) {
        console.log('stdout: ' + data.toString());
        outputChannel.append(data.toString());
    });
    nodeExecution.stderr.on('data', function (data) {
        console.log('stderr: ' + data.toString());
        outputChannel.append(data.toString());
    });
    nodeExecution.on('exit', function (code) {
        console.log('child process exited with code ' + code.toString());
    });
}
