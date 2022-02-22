import { HelpWindow, shutdownWindows } from "./sketch/window";

function onRun(key: any, context: any) {
  // @ts-ignore
  globalThis.context = context
  const sketchWebview = new HelpWindow()
  sketchWebview.pushMessage('Sketch Webview is starting')
}

// When the plugin is shutdown by Sketch (for example when the user disable the plugin)
// we need to close the webview if it's open
function onShutdown(key: any, context: any) {
  // @ts-ignore
  globalThis.context = context
  shutdownWindows()
}

// @ts-ignore
globalThis.onRun = onRun
// @ts-ignore
globalThis.onShutdown = onShutdown
