import typescript from 'rollup-plugin-typescript2'
import { terser } from 'rollup-plugin-terser'

export default {
  input: 'src/index.ts',
  output: [{
    format: 'umd',
    file: 'dist/index.js',
    sourcemap: true,
    name: 'naiv'
  }, {
    format: 'es',
    file: 'dist/index.es.js',
    sourcemap: true
  }],
  plugins: [
    typescript(),
    terser({
      mangle: {
        properties: {
          regex: /^_/
        }
      }
    })
  ]
}
