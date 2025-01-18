import path from 'node:path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import pkg from './package.json';

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
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'VueModule',
      fileName: format => `index.${format}.js`
    },
    rollupOptions: {
      external: ['vue', '@vueuse/core'],
      output: {
        globals: {
          vue: 'Vue',
          '@vueuse/core': 'VueUse'
        }
      }
    },
    sourcemap: true
  }
});
