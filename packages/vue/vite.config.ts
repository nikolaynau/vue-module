import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

const __dirname = dirname(fileURLToPath(import.meta.url));

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
      name: 'VueModuleVue',
      fileName: format => `index.${format}.js`
    },
    rollupOptions: {
      external: ['vue', '@vuemodule/core'],
      output: {
        globals: {
          vue: 'Vue',
          '@vuemodule/core': 'VueModuleCore'
        }
      }
    },
    sourcemap: true
  }
});
