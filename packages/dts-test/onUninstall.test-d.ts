import { expectType, expectError } from 'tsd';
import { defineModule } from '@vuemodule/core';
import type { ModuleInstance, ModuleOptions } from '@vuemodule/core';
import type { ModuleAReturn } from './moduleA';
import './moduleB';

defineModule(({ onUninstall }) => {
  // Single module key
  expectType<void>(onUninstall('moduleA', () => {}));

  expectType<void>(onUninstall('customModule', () => {}));

  // 'any' keyword
  expectType<void>(onUninstall('any', () => {}));

  // No name, just a callback
  expectType<void>(onUninstall(() => {}));

  onUninstall('moduleA', instance => {
    expectType<ModuleInstance<ModuleOptions, ModuleAReturn>>(instance);
  });

  onUninstall('any', instance => {
    expectType<ModuleInstance>(instance);
  });

  onUninstall(instance => {
    expectType<ModuleInstance>(instance);
  });

  // Error
  expectError(onUninstall(['moduleA', 'moduleC'], () => {}));

  // Missing callback for single key
  expectError(onUninstall('moduleA'));

  // Missing callback for multiple keys
  expectError(onUninstall(['moduleA', 'moduleB']));

  expectError(onUninstall());
});
