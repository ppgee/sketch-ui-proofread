import dts from 'rollup-plugin-dts'
import esbuild from 'rollup-plugin-esbuild'
import { terser } from 'rollup-plugin-terser'

const name = require('./package.json').name

const bundle = (envType, config) => ({
  ...config,
  input: `src/${envType}.ts`,
  external: id => !/^[./]/.test(id),
})

export default ['server', 'client'].reduce((bundles, envType) => {
  return bundles.concat([
    bundle(envType, {
      plugins: [esbuild(), terser()],
      output: [
        {
          file: `dist/${name}-${envType}.js`,
          format: 'es'
        }
      ],
    }),
    bundle(envType, {
      plugins: [dts()],
      output: {
        file: `dist/${name}-${envType}.d.ts`,
        format: 'es',
      },
    }),
  ])
}, [])
