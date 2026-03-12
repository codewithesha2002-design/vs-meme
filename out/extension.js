"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = require("vscode");
const path = require("path");
const cp = require("child_process");
const fs = require("fs");
const CONFIG_NAMESPACE = 'vs-meme';
const DEFAULT_SOUND_FILE = 'faahh.wav';
let lastPlayedAt = 0;
const COOLDOWN_MS = 1200;
function activate(context) {
    console.log('VS-Meme extension is now active!');
    // Listen for terminal command completion
    const disposable = vscode.window.onDidEndTerminalShellExecution(event => {
        // A non-zero exit code means the command failed
        if (event.exitCode !== 0 && event.exitCode !== undefined) {
            triggerMemeSound(context);
        }
    });
    context.subscriptions.push(disposable);
}
function getConfig() {
    return vscode.workspace.getConfiguration(CONFIG_NAMESPACE);
}
async function triggerMemeSound(context) {
    const config = getConfig();
    if (!config.get('enabled', true)) {
        return;
    }
    if (Date.now() - lastPlayedAt < COOLDOWN_MS) {
        return; // Prevent spamming sounds
    }
    const soundPath = resolveSoundPath(context);
    if (!soundPath) {
        return;
    }
    // Show a notification
    vscode.window.showInformationMessage('faahh! Command failed.');
    playSound(soundPath);
    lastPlayedAt = Date.now();
}
function resolveSoundPath(context) {
    const customPathValue = String(getConfig().get('customSoundPath', '')).trim();
    if (customPathValue.length > 0) {
        // Basic resolution logic for custom path
        const resolvedPath = path.isAbsolute(customPathValue)
            ? customPathValue
            : path.resolve(customPathValue);
        if (fs.existsSync(resolvedPath)) {
            return resolvedPath;
        }
        else {
            vscode.window.showWarningMessage(`VS Meme: Custom sound not found at "${customPathValue}". Using default sound.`);
        }
    }
    // Fallback to default sound
    const defaultPath = path.join(context.extensionPath, 'assets', DEFAULT_SOUND_FILE);
    if (fs.existsSync(defaultPath)) {
        return defaultPath;
    }
    vscode.window.showErrorMessage(`VS Meme: Default sound file is missing (${DEFAULT_SOUND_FILE}).`);
    return null;
}
function playSound(soundPath) {
    if (process.platform === 'win32') {
        playOnWindows(soundPath);
    }
    else if (process.platform === 'darwin') {
        cp.exec(`afplay "${soundPath}"`);
    }
    else {
        // Linux fallback
        cp.exec(`paplay "${soundPath}" || aplay "${soundPath}"`);
    }
}
function playOnWindows(soundPath) {
    const escapedPath = soundPath.replace(/'/g, "''");
    // Use WPF MediaPlayer for robust playback (supports MP3 and WAV)
    const script = [
        "$ErrorActionPreference = 'Stop'",
        `$path = '${escapedPath}'`,
        'Add-Type -AssemblyName presentationCore',
        '$player = New-Object System.Windows.Media.MediaPlayer',
        'try { $player.Open([Uri] $path); $deadline = [DateTime]::UtcNow.AddSeconds(3); while (-not $player.NaturalDuration.HasTimeSpan -and [DateTime]::UtcNow -lt $deadline) { Start-Sleep -Milliseconds 100 }; $player.Volume = 1.0; $player.Play(); $durationMs = if ($player.NaturalDuration.HasTimeSpan) { [Math]::Max(500, [int]$player.NaturalDuration.TimeSpan.TotalMilliseconds) } else { 2500 }; Start-Sleep -Milliseconds ([Math]::Min($durationMs, 4000)) } finally { if ($player) { $player.Stop(); $player.Close() } }'
    ].join('; ');
    const command = `powershell.exe -NoProfile -NonInteractive -STA -Command "${script.replace(/"/g, '\\"')}"`;
    cp.exec(command, (error) => {
        if (error) {
            console.error(`Failed to play WPF sound: ${error}`);
            // Fallback to simpler SoundPlayer if WPF fails (only works for WAV)
            if (path.extname(soundPath).toLowerCase() === '.wav') {
                const fallbackScript = `(New-Object Media.SoundPlayer '${escapedPath}').PlaySync()`;
                cp.exec(`powershell.exe -c "${fallbackScript}"`);
            }
        }
    });
}
function deactivate() { }
//# sourceMappingURL=extension.js.map