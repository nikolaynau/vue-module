import { expectType, expectError } from 'tsd';
import type { ModuleContext, ModuleOptions } from '@vuemodule/core';
import { defineModule } from '@vuemodule/core';
import type { ModuleAOptions, ModuleAReturn } from './moduleA';

defineModule<ModuleAOptions>('moduleA', context => {
  expectType<ModuleContext<ModuleAOptions>>(context);
  return { bar: 'baz' };
});

defineModule('moduleB', context => {
  expectType<ModuleContext<ModuleOptions>>(context);
  return { foo: 'bar' };
});

defineModule({
  meta: { name: 'moduleA' },
  setup: context => {
    expectType<ModuleContext<ModuleOptions>>(context);
    return { result: 'some value' };
  }
});

expectError(
  defineModule<ModuleAOptions, ModuleAReturn>('moduleA', () => {
    return { b: 'wrong type' };
  })
);

expectError(
  defineModule<ModuleAOptions, ModuleAReturn>({
    meta: { name: 'moduleA' },
    setup: context => {
      expectType<ModuleContext<ModuleAOptions>>(context);
      return { result: 'some value' };
    }
  })
);
