import { defineModule } from '@vuemodule/core';

export interface ModuleOptions {
  foo: string;
  baz?: number;
}

export interface ModuleSetupReturn {
  bar: string;
}

export default defineModule<ModuleOptions, ModuleSetupReturn>('moduleA', () => {
  return {
    bar: 'bar'
  };
});
