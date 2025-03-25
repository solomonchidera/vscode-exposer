import * as vscode from 'vscode';
import { Client } from 'discord-rpc';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config({ path: require('path').resolve(__dirname, '../.env') });

const clientId = 1351518814852091954; // Fallback if not found
let rpc: Client | undefined;
let isConnected = false;

export function activate(context: vscode.ExtensionContext) {
    console.log('Extension "vscode-exposer" is now active!');

    if (!clientId) {
        console.error('DISCORD_CLIENT_ID not found in .env file!');
        vscode.window.showErrorMessage('Please set DISCORD_CLIENT_ID in your .env file.');
        return;
    }

// Use WebSocket transport instead of IPC
    rpc = new Client({ transport: 'websocket' });

    rpc.on('ready', () => {
        isConnected = true;
        console.log('Connected to Discord via WebSocket!');
        updateDiscordStatus();
    });

    rpc.on('error', (error) => {
        console.error('Discord RPC Error:', error);
        isConnected = false;
    });

    function connectToDiscord(attempt = 1, maxAttempts = 5) {
        rpc?.login({ clientId: String(clientId) }).catch((error) => {
            console.error(`Connection attempt ${attempt} failed:`, error.message);
            if (attempt < maxAttempts) {
                console.log(`Retrying in ${attempt} second(s)...`);
                setTimeout(() => connectToDiscord(attempt + 1, maxAttempts), attempt * 1000);
            } else {
                console.error('Max attempts reached. Could not connect to Discord.');
                vscode.window.showErrorMessage('Failed to connect to Discord after multiple attempts.');
            }
        });
    }

    connectToDiscord();

    function updateDiscordStatus() {
        if (!isConnected || !rpc) {
            return;
        };

        const activeEditor = vscode.window.activeTextEditor;
        if (activeEditor) {
            const filePath = activeEditor.document.uri.fsPath;
            const fileName = filePath.split(/[\\/]/).pop();
            rpc.setActivity({
                details: `Editing: ${fileName}`,
                state: 'In VS Code',
                startTimestamp: new Date(),
                largeImageKey: 'vscode',
                largeImageText: 'Visual Studio Code',
            });
            console.log(`Updated Discord: Editing ${fileName}`);
        } else {
            rpc.setActivity({
                details: 'Idle',
                state: 'In VS Code',
                startTimestamp: new Date(),
                largeImageKey: 'vscode',
            });
            console.log('Updated Discord: Idle');
        }
    }

    context.subscriptions.push(
        vscode.window.onDidChangeActiveTextEditor(() => {
            updateDiscordStatus();
        })
    );

    context.subscriptions.push(
        vscode.workspace.onDidChangeTextDocument((event) => {
            if (vscode.window.activeTextEditor?.document === event.document) {
                updateDiscordStatus();
            }
        })
    );
}

export function deactivate() {
    if (rpc) {
        rpc.destroy();
        console.log('Disconnected from Discord');
    }
    console.log('Extension "discord-file-status" is now deactivated.');
}