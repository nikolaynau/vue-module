import { expectType, expectError } from 'tsd';
import { type ModuleKey, type ModuleKeys, onInstalled } from '@vuemodule/core';
import './moduleA';
import './moduleB';

// Single module key
expectType<void>(onInstalled('moduleA', () => {}));

// Multiple module keys as an array
expectType<void>(onInstalled(['moduleA'], () => {}));

// 'all' keyword
expectType<void>(onInstalled('all', () => {}));

// No name, just a callback
expectType<void>(onInstalled(() => {}));

expectError(onInstalled<ModuleKey>('moduleC', () => {}));

expectError(onInstalled<ModuleKeys>(['moduleA', 'moduleC'], () => {}));

// Missing callback for single key
expectError(onInstalled('moduleA'));

// Missing callback for multiple keys
expectError(onInstalled(['moduleA', 'moduleB']));

expectError(onInstalled());
