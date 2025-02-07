import { expectType, expectError } from 'tsd';
import { defineModule } from '@vuemodule/core';
import type {
  ModuleKey,
  ModuleKeys,
  ModuleOptions,
  ModuleValue,
  ResolvedModule
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

  onInstalled('moduleA', resolved => {
    expectType<ResolvedModule<ModuleOptions, ModuleAReturn>>(resolved);
  });

  onInstalled('any', resolved => {
    expectType<ResolvedModule>(resolved);
  });

  onInstalled('all', resolved => {
    expectType<ResolvedModule[]>(resolved);
  });

  onInstalled(resolved => {
    expectType<ResolvedModule>(resolved);
  });

  onInstalled(
    ['moduleA', 'customModule', 'moduleB'],
    ([moduleA, customModule, moduleB]) => {
      expectType<ResolvedModule<ModuleOptions, ModuleAReturn>>(moduleA);
      expectType<ResolvedModule>(customModule);
      expectType<ResolvedModule<ModuleOptions, ModuleValue<'moduleB'>>>(
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
