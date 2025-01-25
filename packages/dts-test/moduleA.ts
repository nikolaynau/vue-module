import { defineModule, type ModuleKey } from '@vuemodule/core';

export interface ModuleAOptions {
  foo: string;
  baz?: number;
}

export interface ModuleAReturn {
  bar: string;
}

declare module '@vuemodule/core' {
  interface ModuleMap {
    moduleA: ModuleAReturn;
  }
}

export default defineModule<ModuleAOptions, ModuleAReturn, ModuleKey>(
  'moduleA',
  () => {
    return {
      bar: 'baz'
    };
  }
);
