import { dirname, resolve } from 'node:path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import pkg from './package.json';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

process.env = Object.assign(process.env ?? {}, {
  VITE_BUILD_VERSION: pkg.version
});

export default defineConfig({
  plugins: [
    dts({
      include: ['src'],
      tsconfigPath: 'tsconfig.json',
      rollupTypes: true
    })
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'VueModuleCore',
      fileName: format => `index.${format}.js`
    },
    sourcemap: true
  }
});
