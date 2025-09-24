"use strict";
// import * as vscode from 'vscode';
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
// export function activate(context: vscode.ExtensionContext) {
//   const cmd = vscode.commands.registerCommand('uocc.coachFile', async () => {
//     const editor = vscode.window.activeTextEditor;
//     if (!editor) {
//       vscode.window.showInformationMessage('Open a file first.');
//       return;
//     }
//     const panel = vscode.window.createWebviewPanel(
//       'uoccCoach',
//       'UOCC Coach',
//       { viewColumn: vscode.ViewColumn.Beside, preserveFocus: true },
//       {
//         enableScripts: true,
//         retainContextWhenHidden: true,
//         localResourceRoots: [vscode.Uri.joinPath(context.extensionUri, 'dist', 'panel')],
//       }
//     );
//     // dist assets
//     const scriptUri = panel.webview.asWebviewUri(
//       vscode.Uri.joinPath(context.extensionUri, 'dist', 'panel', 'panel.js')
//     );
//     const styleUri = panel.webview.asWebviewUri(
//       vscode.Uri.joinPath(context.extensionUri, 'dist', 'panel', 'panel.css')
//     );
//     const csp = `
//       default-src 'none';
//       img-src ${panel.webview.cspSource} https: data:;
//       style-src ${panel.webview.cspSource} 'unsafe-inline';
//       script-src ${panel.webview.cspSource};
//       connect-src http://localhost:3000;
//       media-src data:;
//     `;
//     panel.webview.html = `<!doctype html>
// <html>
//   <head>
//     <meta charset="utf-8" />
//     <meta http-equiv="Content-Security-Policy" content="${csp.replace(/\n/g,' ')}">
//     <meta name="viewport" content="width=device-width, initial-scale=1.0" />
//     <link href="${styleUri}" rel="stylesheet" />
//     <title>UOCC Coach</title>
//   </head>
//   <body>
//     <div class="header">
//       <label><input type="radio" name="mode" value="coach" checked> Coach</label>
//       <label><input type="radio" name="mode" value="answer"> Answer</label>
//       <span class="vr"></span>
//       <label>Voice: <input type="checkbox" id="voiceToggle" checked></label>
//       <button id="micBtn" title="Record">🎤</button>
//     </div>
//     <div class="controls">
//       <button id="analyzeBtn">Analyze</button>
//       <button id="evaluateBtn">Run checks</button>
//       <button id="revealBtn">Reveal next hint</button>
//       <button id="speakBtn">🔊 Speak</button>
//       <button id="getAnswerBtn">Get Answer</button>
//     </div>
//     <section><h3>Code preview</h3><pre id="code"></pre></section>
//     <section><h3>Hints</h3>
//       <div id="hint1" class="hint"></div>
//       <div id="hint2" class="hint locked"></div>
//       <div id="hint3" class="hint locked"></div>
//     </section>
//     <section><h3>Test results</h3><div id="tests"></div></section>
//     <section><h3>Chat</h3><div id="uocc-chat" class="chat"></div></section>
//     <section><h3>Session meter</h3><div id="meter">State: idle</div></section>
//     <script src="${scriptUri}"></script>
//   </body>
// </html>`;
//     // Prepare initial payload now
//     const initial = () => {
//       const ed = vscode.window.activeTextEditor;
//       if (!ed) return { source: '', lang: 'plaintext', filename: '' };
//       return {
//         source: ed.document.getText(),
//         lang: ed.document.languageId,
//         filename: ed.document.fileName,
//       };
//     };
//     // Send initial immediately and on request
//     panel.webview.postMessage({ type: 'initial', payload: initial() });
//     panel.webview.onDidReceiveMessage((msg) => {
//       if (!msg) return;
//       if (msg.type === 'getInitial') {
//         panel.webview.postMessage({ type: 'initial', payload: initial() });
//         return;
//       }
//       if (msg.type === 'decorate' && msg.payload) {
//         const { startLine, endLine, reason } = msg.payload as {
//           startLine: number; endLine: number; reason?: string;
//         };
//         const ed = vscode.window.activeTextEditor;
//         if (!ed) return;
//         const deco = vscode.window.createTextEditorDecorationType({
//           backgroundColor: new vscode.ThemeColor('editor.wordHighlightStrongBackground'),
//           overviewRulerColor: 'rgba(255,165,0,0.8)',
//           overviewRulerLane: vscode.OverviewRulerLane.Right,
//         });
//         const range = new vscode.Range(
//           new vscode.Position(Math.max(0, startLine ?? 0), 0),
//           new vscode.Position(Math.max(0, endLine ?? 0), 10000)
//         );
//         ed.setDecorations(deco, [range]);
//         if (reason) vscode.window.setStatusBarMessage(`UOCC: ${reason}`, 3000);
//         panel.onDidDispose(() => deco.dispose());
//       }
//     });
//   });
//   context.subscriptions.push(cmd);
// }
// export function deactivate() {}
const vscode = require("vscode");
const path = require("path");
function activate(context) {
    const cmd = vscode.commands.registerCommand('uocc.coachFile', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showInformationMessage('Open a file first.');
            return;
        }
        const panel = vscode.window.createWebviewPanel('uoccCoach', 'UOCC Coach', { viewColumn: vscode.ViewColumn.Beside, preserveFocus: true }, {
            enableScripts: true,
            retainContextWhenHidden: true,
            localResourceRoots: [
                vscode.Uri.joinPath(context.extensionUri, 'dist', 'panel'),
                vscode.Uri.joinPath(context.extensionUri, 'src', 'panel'),
            ],
        });
        // Resolve CSS/JS with dist → src fallback
        const cssFile = (await exists(context, 'dist/panel/panel.css'))
            ? vscode.Uri.joinPath(context.extensionUri, 'dist', 'panel', 'panel.css')
            : vscode.Uri.joinPath(context.extensionUri, 'src', 'panel', 'panel.css');
        const jsFile = (await exists(context, 'dist/panel/panel.js'))
            ? vscode.Uri.joinPath(context.extensionUri, 'dist', 'panel', 'panel.js')
            : vscode.Uri.joinPath(context.extensionUri, 'src', 'panel', 'panel.js');
        const cssUri = panel.webview.asWebviewUri(cssFile);
        const jsUri = panel.webview.asWebviewUri(jsFile);
        const nonce = makeNonce();
        const csp = [
            "default-src 'none'",
            `img-src ${panel.webview.cspSource} https: data:`,
            `style-src ${panel.webview.cspSource} 'unsafe-inline'`,
            // allow external script files (panel.js) from our extension
            `script-src ${panel.webview.cspSource}`,
            // allow API calls to your backend
            `connect-src http://localhost:3000`
        ].join('; ');
        panel.webview.html = `
    <!doctype html>
    <html>
    <head>
      <meta charset="utf-8" />
      <meta http-equiv="Content-Security-Policy" content="${csp}">
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <link href="${cssUri}" rel="stylesheet" />
      <title>UOCC Coach</title>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <span class="title">UOCC Coach</span>
          <div class="mode">
            <label><input type="radio" name="mode" value="coach" checked> Coach</label>
            <label><input type="radio" name="mode" value="answer" id="modeAnswer"> Answer</label>
            <span class="vr"></span>
            <label>Voice: <input type="checkbox" id="voiceToggle" checked></label>
            <label style="margin-left:12px;">Answer Voice:
              <input type="checkbox" id="answerVoiceToggle" checked>
            </label>
            <button id="micBtn" title="Record 4s">🎤</button>
          </div>
        </div>

        <div class="controls">
          <button id="analyzeBtn">Analyze</button>
          <button id="evaluateBtn">Run checks</button>
          <button id="revealBtn">Reveal next hint</button>
          <button id="getAnswerBtn">Get Answer</button>
          <button id="speakBtn">🔊 Speak</button>
        </div>

        <section>
          <h3>Code preview</h3>
          <pre id="code"></pre>
        </section>

        <section>
          <h3>Hints</h3>
          <div id="hints">
            <div class="hint" id="hint1"></div>
            <div class="hint locked" id="hint2"></div>
            <div class="hint locked" id="hint3"></div>
          </div>
        </section>

        <section>
          <h3>Test results</h3>
          <div id="tests"></div>
        </section>

        <section>
          <h3>Chat</h3>
          <div id="uocc-chat" class="chat"></div>
        </section>

        <section>
          <h3>Session meter</h3>
          <div id="meter">State: idle</div>
        </section>
      </div>

      <script src="${jsUri}"></script>
    </body>
    </html>`;
        // Send initial doc once panel is ready
        const sendInitial = () => panel.webview.postMessage({
            type: 'initial',
            payload: {
                source: editor.document.getText(),
                lang: editor.document.languageId,
                filename: path.basename(editor.document.fileName),
            }
        });
        sendInitial();
        panel.webview.onDidReceiveMessage((msg) => {
            if (msg?.type === 'getInitial')
                sendInitial();
            if (msg?.type === 'decorate' && msg.payload) {
                const { startLine = 0, endLine = 0, reason = '' } = msg.payload;
                const deco = vscode.window.createTextEditorDecorationType({
                    backgroundColor: new vscode.ThemeColor('editor.hoverHighlightBackground'),
                    overviewRulerColor: new vscode.ThemeColor('editorWarning.foreground'),
                    overviewRulerLane: vscode.OverviewRulerLane.Right,
                    isWholeLine: true,
                });
                const range = new vscode.Range(new vscode.Position(Math.max(0, startLine), 0), new vscode.Position(Math.max(0, endLine), 10000));
                editor.setDecorations(deco, [range]);
                panel.onDidDispose(() => deco.dispose());
            }
        });
    });
    context.subscriptions.push(cmd);
}
function deactivate() { }
function makeNonce() {
    const s = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    return Array.from({ length: 32 }, () => s[Math.floor(Math.random() * s.length)]).join('');
}
async function exists(ctx, rel) {
    try {
        const uri = vscode.Uri.joinPath(ctx.extensionUri, ...rel.split('/'));
        await vscode.workspace.fs.stat(uri);
        return true;
    }
    catch {
        return false;
    }
}
