import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

const __dirname = dirname(fileURLToPath(import.meta.url));

const MODULE_CORE_LIB = '@vuemodule/core';

export default defineConfig({
  plugins: [
    dts({
      entryRoot: 'src/builtin',
      include: ['src/builtin'],
      tsconfigPath: 'tsconfig.json',
      rollupTypes: false,
      aliasesExclude: [MODULE_CORE_LIB],
      outDir: 'dist/builtin'
    })
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/builtin/index.ts'),
      name: 'VueModuleVueBuiltin',
      fileName: format => `builtin.${format}.js`
    },
    rollupOptions: {
      external: ['vue', 'vue-router', MODULE_CORE_LIB],
      output: {
        globals: {
          vue: 'Vue',
          'vue-router': 'VueRouter',
          [MODULE_CORE_LIB]: 'VueModuleCore'
        }
      }
    },
    sourcemap: true,
    outDir: 'dist/builtin'
  }
});
