import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

const __dirname = dirname(fileURLToPath(import.meta.url));

const MODULE_CORE_LIB = '@vuemodule/core';

export default defineConfig({
  plugins: [
    dts({
      include: ['src'],
      tsconfigPath: 'tsconfig.json',
      rollupTypes: true,
      aliasesExclude: [MODULE_CORE_LIB]
    })
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'VueModuleVue',
      fileName: format => `index.${format}.js`
    },
    rollupOptions: {
      external: ['vue', MODULE_CORE_LIB],
      output: {
        globals: {
          vue: 'Vue',
          [MODULE_CORE_LIB]: 'VueModuleCore'
        }
      }
    },
    sourcemap: true
  }
});
