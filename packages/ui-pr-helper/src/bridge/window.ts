export function getWebviewUrl() {
  return import.meta.env.VITE_ENV_MODE === 'dev'? 'http://localhost:4444' : '../Resources/webview.html'
}