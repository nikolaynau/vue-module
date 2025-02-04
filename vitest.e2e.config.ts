import { mergeConfig } from 'vitest/config';
import config from './vitest.config';

export default mergeConfig(config, {
  test: {
    name: 'e2e',
    include: ['packages/core/__test__/e2e/*']
  }
});
