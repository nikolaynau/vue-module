import { expectType, expectError } from 'tsd';
import { defineModule } from '@vuemodule/core';
import type {
  ModuleInstance,
  ModuleKey,
  ModuleKeys,
  ModuleOptions,
  ModuleValue
} from '@vuemodule/core';
import type { ModuleAReturn } from './moduleA';
import './moduleB';

defineModule(({ onInstalled }) => {
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

  onInstalled('moduleA', instance => {
    expectType<ModuleInstance<ModuleOptions, ModuleAReturn>>(instance);
  });

  onInstalled('any', instance => {
    expectType<ModuleInstance>(instance);
  });

  onInstalled('all', instance => {
    expectType<ModuleInstance[]>(instance);
  });

  onInstalled(instance => {
    expectType<ModuleInstance>(instance);
  });

  onInstalled(
    ['moduleA', 'customModule', 'moduleB'],
    ([moduleA, customModule, moduleB]) => {
      expectType<ModuleInstance<ModuleOptions, ModuleAReturn>>(moduleA);
      expectType<ModuleInstance>(customModule);
      expectType<ModuleInstance<ModuleOptions, ModuleValue<'moduleB'>>>(
        moduleB
      );
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
});
