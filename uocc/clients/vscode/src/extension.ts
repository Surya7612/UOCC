import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand('uocc.coachFile', async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return vscode.window.showInformationMessage('Open a file to coach.');
    }
    const doc = editor.document;
    const source = doc.getText();
    const lang = doc.languageId;
    const filename = doc.fileName;

    const panel = vscode.window.createWebviewPanel(
      'uoccCoach',
      'UOCC Coach',
      vscode.ViewColumn.Beside,
      { enableScripts: true, retainContextWhenHidden: true }
    );

    const html = getPanelHtml(panel, context);
    panel.webview.html = html;

    panel.webview.onDidReceiveMessage(async (msg) => {
      switch (msg?.type) {
        case 'getInitial': {
          panel.webview.postMessage({ type: 'initial', payload: { source, lang, filename } });
          break;
        }
        case 'decorate': {
          decorate(editor, msg.payload);
          break;
        }
        default:
          break;
      }
    });
  });

  context.subscriptions.push(disposable);
}

function getPanelHtml(panel: vscode.WebviewPanel, context: vscode.ExtensionContext): string {
  const webview = panel.webview;
  const uri = (p: string) => webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, 'src', 'panel', p));
  const scriptUri = uri('panel.js');
  const styleUri = uri('panel.css');
  const indexUri = uri('index.html');

  // Basic wrapper loads index.html and injects URIs
  return `<!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <link rel="stylesheet" href="${styleUri}">
      <title>UOCC Coach</title>
    </head>
    <body>
      <div id="app"></div>
      <script>window.__INDEX__='${indexUri}'; window.acquireVsCodeApi = acquireVsCodeApi;</script>
      <script src="${scriptUri}"></script>
    </body>
  </html>`;
}

export function deactivate() {}

function decorate(editor: vscode.TextEditor, payload: any) {
  const { startLine, endLine, reason } = payload || {};
  if (typeof startLine !== 'number' || typeof endLine !== 'number') return;
  const decorationType = vscode.window.createTextEditorDecorationType({
    backgroundColor: new vscode.ThemeColor('editor.wordHighlightBackground'),
    isWholeLine: true,
    overviewRulerColor: new vscode.ThemeColor('editor.wordHighlightBorder')
  });
  const range = new vscode.Range(startLine, 0, endLine, 0);
  editor.setDecorations(decorationType, [{ range, hoverMessage: reason }]);
}


