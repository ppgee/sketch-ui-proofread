import { HelpWindow, shutdownWindows } from "./sketch/window";

export default function() {
  const sketchWebview = new HelpWindow()
  sketchWebview.pushMessage('Sketch Webview is starting')
}

// When the plugin is shutdown by Sketch (for example when the user disable the plugin)
// we need to close the webview if it's open
export function onShutdown() {
  shutdownWindows()
}


