import { defineConfig } from 'vite'
import { resolve } from 'path'
import vue from '@vitejs/plugin-vue'
import Inspect from 'vite-plugin-inspect'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { HeadlessUiResolver } from 'unplugin-vue-components/resolvers'
import Copy from 'rollup-plugin-copy'
import Delete from 'rollup-plugin-delete'
import manifest from './src/manifest'

const PLUGIN_PREFIX = 'ui-pr-helper.sketchplugin/Contents'

const ENTRY_FILES = {
  COMMAND: 'src/main.ts',
  WEBVIEW: 'src/webview/index.html',
}

const getEntryFileNames = (chunkInfo: { facadeModuleId: string }) => {
  return chunkInfo.facadeModuleId.indexOf(ENTRY_FILES.WEBVIEW) > -1 ? 'Resources/[name].js' : '[name].js'
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  let inputOptions = {
    webview: resolve(__dirname, ENTRY_FILES.WEBVIEW)
  }
  // 开发模式只需要关注开发页面
  if (mode !== 'development') {
    Object.assign(inputOptions, {
      'Sketch/__my-command': resolve(__dirname, ENTRY_FILES.COMMAND),
    })
  }

  return {
    root: './src/',
    base: mode !== 'development' ? './' : '/',
    define: {
      '__IDENTIFIER__': '"ui-pr-helper"',
      '__IPHONE6_WIDTH__': 375,
      '__IPHONE6_HEIGHT__': 667,
      '__INITIAL_POINT_X__': 0,
      '__INITIAL_POINT_Y__': 0,
    },
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
      }
    },
    server: {
      open: '/webview/index.html',
      host: true,
      port: 4444,
    },
    build: {
      emptyOutDir: true,
      outDir: resolve(__dirname, PLUGIN_PREFIX),
      rollupOptions: {
        input: inputOptions,
        output: {
          chunkFileNames: 'Resources/[name].js',
          entryFileNames: getEntryFileNames,
          assetFileNames: 'Resources/[ext]/[name].[ext]'
        },
        external: [
          'sketch',
          'sketch/dom'
        ]
      }
    },
    plugins: [
      vue(),
      AutoImport({
        include: [
          /\.[tj]sx?$/, // .ts, .tsx, .js, .jsx
          /\.vue$/, /\.vue\?vue/, // .vue
        ],
        imports: [
          'vue'
        ]
      }),
      Components({
        resolvers: [
          HeadlessUiResolver()
        ]
      }),
      Copy({
        hook: 'closeBundle',
        targets: [
          {
            src: `${PLUGIN_PREFIX}/webview/index.html`,
            dest: `${PLUGIN_PREFIX}/Resources`,
            rename: 'webview.html',
            transform: (contents) => contents.toString().replace(/\/Resources/g, '')
          },
          {
            src: resolve(__dirname, 'src/manifest.ts'),
            dest: `${PLUGIN_PREFIX}/Sketch`,
            rename: 'manifest.json',
            transform: () => JSON.stringify(manifest, null, 2)
          }
        ]
      }),
      Delete({
        hook: 'closeBundle',
        targets: [`${PLUGIN_PREFIX}/webview`]
      }),
      Inspect()
    ],
  }
})
