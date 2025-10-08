import { fileURLToPath } from 'node:url';
import { defineConfig, configDefaults } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    reporters: 'dot',
    root: fileURLToPath(new URL('./', import.meta.url)),
    projects: [
      {
        test: {
          name: 'unit',
          exclude: [...configDefaults.exclude, '**/e2e/**']
        }
      },
      {
        test: {
          name: 'e2e',
          include: ['packages/core/__test__/e2e/*']
        }
      }
    ]
  }
});
