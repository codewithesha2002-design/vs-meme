import * as vscode from 'vscode';

let isMemeModeEnabled = true;
let statusBarItem: vscode.StatusBarItem;
/**
 * Activate the extension
 */
export function activate(context: vscode.ExtensionContext) {
    console.log('Meme Dev Mode is now active! 🚀');

    // Initialize Status Bar Item
    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.command = 'meme-dev-mode.toggle';
    context.subscriptions.push(statusBarItem);
    updateStatusBarItem();

    // Register Toggle Command
    let toggleCommand = vscode.commands.registerCommand('meme-dev-mode.toggle', () => {
        isMemeModeEnabled = !isMemeModeEnabled;
        if (isMemeModeEnabled) {
            vscode.window.showInformationMessage('Meme Dev Mode Enabled! 🚀');
            triggerUpdateDecorations();
        } else {
            vscode.window.showInformationMessage('Meme Dev Mode Disabled. 🛑');
            clearAllDecorations();
        }
        updateStatusBarItem();
    });
    context.subscriptions.push(toggleCommand);

    // Listen for text changes - Optimized keyword detection
    vscode.workspace.onDidChangeTextDocument((event: vscode.TextDocumentChangeEvent) => {
        if (!isMemeModeEnabled) return;

        const editor = vscode.window.activeTextEditor;
        if (editor && event.document === editor.document) {
            detectMemeKeywords(event);
            triggerUpdateDecorations(editor);
        }
    }, null, context.subscriptions);

    // Listen for active editor changes
    vscode.window.onDidChangeActiveTextEditor((editor: vscode.TextEditor | undefined) => {
        if (editor && isMemeModeEnabled) {
            triggerUpdateDecorations(editor);
        }
    }, null, context.subscriptions);

    // Initial decoration
    if (vscode.window.activeTextEditor) {
        triggerUpdateDecorations(vscode.window.activeTextEditor);
    }

    // Hover Provider for "baingan" and "ayenn function()"
    const hoverProvider = vscode.languages.registerHoverProvider({ scheme: 'file' }, {
        provideHover(document: vscode.TextDocument, position: vscode.Position) {
            if (!isMemeModeEnabled) return;

            const range = document.getWordRangeAtPosition(position);
            if (!range) return;

            const word = document.getText(range);
            const line = document.lineAt(position).text;


            if (line.includes('ayenn function()')) {
                return new vscode.Hover('**Ayenn!** 🚀\n\nFunction activated with full swag.');
            }
        }
    });
    context.subscriptions.push(hoverProvider);
}

function updateStatusBarItem(): void {
    if (isMemeModeEnabled) {
        statusBarItem.text = `$(rocket) Meme Energy: Full`;
        statusBarItem.tooltip = 'Click to disable Meme Dev Mode';
        statusBarItem.show();
    } else {
        statusBarItem.text = `$(dash) Meme Energy: Low`;
        statusBarItem.tooltip = 'Click to enable Meme Dev Mode';
        statusBarItem.show();
    }
}

/**
 * Detect meme keywords in content changes for better responsiveness
 */
function detectMemeKeywords(event: vscode.TextDocumentChangeEvent) {
    for (const change of event.contentChanges) {
        const text = change.text.toLowerCase();

        if (text.includes('maaf kar de bhai')) {
            vscode.window.showInformationMessage('Error forgiven 😌');
            break;
        }

        if (text.includes('ayenn function()')) {
            vscode.window.showInformationMessage('Function activated, ayenn! 🚀');
            break;
        }
    }
}

let timeout: any | undefined = undefined;

/**
 * Trigger decoration updates with a shorter debounce for snappiness
 */
function triggerUpdateDecorations(editor?: vscode.TextEditor) {
    if (timeout) {
        clearTimeout(timeout);
    }
    timeout = setTimeout(() => updateDecorations(editor), 250);
}

function updateDecorations(editor?: vscode.TextEditor) {
    const activeEditor = editor || vscode.window.activeTextEditor;
    if (!activeEditor || !isMemeModeEnabled) {
        return;
    }


}

function clearAllDecorations() {
    throw new Error('Function not implemented.');
}