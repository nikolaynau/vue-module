import { expectType, expectError } from 'tsd';
import { onInstalled } from '@vuemodule/core';
import type {
  ModuleConfig,
  ModuleKey,
  ModuleKeys,
  ModuleOptions,
  ModuleValue
} from '@vuemodule/core';
import type { ModuleAReturn } from './moduleA';
import './moduleB';

// Single module key
expectType<void>(onInstalled('moduleA', () => {}));

expectType<void>(onInstalled('customModule', () => {}));

// Multiple module keys as an array
expectType<void>(onInstalled(['moduleA'], () => {}));

// 'all' keyword
expectType<void>(onInstalled('all', () => {}));

// 'any' keyword
expectType<void>(onInstalled('any', () => {}));

// No name, just a callback
expectType<void>(onInstalled(() => {}));

onInstalled('moduleA', config => {
  expectType<ModuleConfig<ModuleOptions, ModuleAReturn>>(config);
});

onInstalled('any', config => {
  expectType<ModuleConfig>(config);
});

onInstalled('all', config => {
  expectType<ModuleConfig[]>(config);
});

onInstalled(config => {
  expectType<ModuleConfig>(config);
});

onInstalled(
  ['moduleA', 'customModule', 'moduleB'],
  ([moduleA, customModule, moduleB]) => {
    expectType<ModuleConfig<ModuleOptions, ModuleAReturn>>(moduleA);
    expectType<ModuleConfig>(customModule);
    expectType<ModuleConfig<ModuleOptions, ModuleValue<'moduleB'>>>(moduleB);
  }
);

// Error
expectError(onInstalled<ModuleKey>('moduleC', () => {}));

expectError(onInstalled<ModuleKeys>(['moduleA', 'moduleC'], () => {}));

// Missing callback for single key
expectError(onInstalled('moduleA'));

// Missing callback for multiple keys
expectError(onInstalled(['moduleA', 'moduleB']));

expectError(onInstalled());
