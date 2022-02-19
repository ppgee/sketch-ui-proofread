const { author, authorEmail, version } = require('../package.json')
const PLUGIN_IDENT = 'ui-pr-helper'
const IDENTIFIERS = {
  PLUGIN_SOURCE: PLUGIN_IDENT,
  COMMAND_START_HELPER: `${PLUGIN_IDENT}-${author}.command-identifier`
}

const manifest = {
  "$schema": "https://raw.githubusercontent.com/sketch-hq/SketchAPI/develop/docs/sketch-plugin-manifest-schema.json",
  "name": PLUGIN_IDENT,
  "identifier": PLUGIN_IDENT,
  author,
  authorEmail,
  version,
  "compatibleVersion": "3",
  "bundleVersion": 1,
  "disableCocoaScriptPreprocessor": true,
  "appcast": "https://raw.githubusercontent.com//master/.appcast.xml",
  "commands": [
    {
      "name": "start helper",
      "identifier": IDENTIFIERS.COMMAND_START_HELPER,
      "script": "./main.ts",
      "handlers": {
        "run": "onRun",
        "actions": {
          "Shutdown": "onShutdown"
        }
      }
    }
  ],
  "menu": {
    "title": PLUGIN_IDENT,
    "items": [
      IDENTIFIERS.COMMAND_START_HELPER
    ]
  }
}

export default manifest