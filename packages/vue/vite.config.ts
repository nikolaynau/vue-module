import path from 'node:path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

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
