import { expectType, expectError } from 'tsd';
import { defineModule } from '@vuemodule/core';
import type { ModuleOptions, ModuleConfig } from '@vuemodule/core';
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

  onUninstall('moduleA', resolved => {
    expectType<ModuleConfig<ModuleOptions, ModuleAReturn>>(resolved);
  });

  onUninstall('any', resolved => {
    expectType<ModuleConfig>(resolved);
  });

  onUninstall(resolved => {
    expectType<ModuleConfig>(resolved);
  });

  // Error
  expectError(onUninstall(['moduleA', 'moduleC'], () => {}));

  // Missing callback for single key
  expectError(onUninstall('moduleA'));

  // Missing callback for multiple keys
  expectError(onUninstall(['moduleA', 'moduleB']));

  expectError(onUninstall());
});
