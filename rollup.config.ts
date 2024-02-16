import typescript from '@rollup/plugin-typescript';
import { terser } from 'rollup-plugin-terser';

export default {
  input: './src/index.ts', // Adjust if your entry file is located elsewhere
  output: [
    {
      file: './dist/bundle.js',
      format: 'cjs',
    },
  ],
  plugins: [
    typescript(), // Compile TypeScript files
    terser(), // Minify the output (optional)
  ],
  external: [
    'readline-sync', // Exclude node_modules from the bundle
    // List any other dependencies you wish to exclude from the bundle
  ]
};
