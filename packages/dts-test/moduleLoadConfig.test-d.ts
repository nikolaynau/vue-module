import { expectType } from 'tsd';
import type { ModuleLoadConfig, ModuleContext } from '@vuemodule/core';

// Valid ModuleConfig with basic options
const basicModuleLoadConfig: ModuleLoadConfig = {
  loader: async () => ({
    meta: { name: 'TestModule', version: '1.0.0' },
    setup: async context => {
      expectType<ModuleContext>(context); // Ensure context matches
      return { key: 'value' };
    }
  }),
  options: { key: 'value' },
  enforce: 'pre',
  deps: [() => Promise.resolve()]
};
expectType<ModuleLoadConfig>(basicModuleLoadConfig);
