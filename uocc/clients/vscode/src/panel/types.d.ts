// Minimal typings for VS Code webview environment
declare function acquireVsCodeApi(): {
  postMessage: (message: any) => void;
  setState?: (state: any) => void;
  getState?: () => any;
};
