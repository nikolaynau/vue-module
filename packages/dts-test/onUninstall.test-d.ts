import { expectType, expectError } from 'tsd';
import { onUninstall } from '@vuemodule/core';
import type { ModuleConfig, ModuleOptions } from '@vuemodule/core';
import type { ModuleAReturn } from './moduleA';
import './moduleB';

// Single module key
expectType<void>(onUninstall('moduleA', () => {}));

expectType<void>(onUninstall('customModule', () => {}));

// 'any' keyword
expectType<void>(onUninstall('any', () => {}));

// No name, just a callback
expectType<void>(onUninstall(() => {}));

onUninstall('moduleA', config => {
  expectType<ModuleConfig<ModuleOptions, ModuleAReturn>>(config);
});

onUninstall('any', config => {
  expectType<ModuleConfig>(config);
});

onUninstall(config => {
  expectType<ModuleConfig>(config);
});

// Error
expectError(onUninstall(['moduleA', 'moduleC'], () => {}));

// Missing callback for single key
expectError(onUninstall('moduleA'));

// Missing callback for multiple keys
expectError(onUninstall(['moduleA', 'moduleB']));

expectError(onUninstall());
