import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    reporters: 'dot',
    root: fileURLToPath(new URL('./', import.meta.url))
  }
});
