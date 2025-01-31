import { mergeConfig } from 'vitest/config';
import config from './vitest.config';

export default mergeConfig(config, {
  test: {
    name: 'e2e',
    include: ['packages/e2e-test/__test__/e2e/*']
  }
});
