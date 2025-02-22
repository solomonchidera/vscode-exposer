import * as vscode from 'vscode';
import * as RPC from 'discord-rpc';

const clientId = ; // Replace with your Discord application client ID
const rpc = new RPC.Client({ transport: 'ipc' });

export function activate(context: vscode.ExtensionContext) {
    rpc.on('ready', () => {
        console.log('Discord RPC connected');
        updatePresence();
    });

    rpc.login({ clientId }).catch(console.error);

    context.subscriptions.push(
        vscode.workspace.onDidChangeTextDocument(updatePresence),
        vscode.window.onDidChangeActiveTextEditor(updatePresence)
    );
}

function updatePresence() {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
        const fileName = editor.document.fileName;
        const fileType = editor.document.languageId;
        const lineCount = editor.document.lineCount;

        rpc.setActivity({
            details: `Editing ${fileName}`,
            state: `Language: ${fileType}`,
            largeImageKey: 'vscode', // Replace with your image key
            smallImageKey: 'edit', // Replace with your image key
            instance: false,
        });
    }
}

export function deactivate() {
    rpc.destroy();
}