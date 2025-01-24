/* eslint-disable @typescript-eslint/no-explicit-any */

import { expectType, expectError } from 'tsd';
import type { ModuleSetupReturn } from '@vuemodule/core';

// Correct cases for ModuleOptions
const validOptions: ModuleSetupReturn = {
  key1: 'value1', // string
  key2: 123, // number
  key3: true, // boolean
  key4: { nested: 'value' }, // object
  key5: [1, 2, 3], // array
  key6: null, // null (valid as unknown)
  key7: undefined // undefined (valid as unknown)
};
expectType<Record<string, any>>(validOptions);

const emptyOptions: ModuleSetupReturn = {};
expectType<Record<string, any>>(emptyOptions);

// Custom keys with nested objects
const customOptions: ModuleSetupReturn = {
  customKey1: 'value',
  customKey2: 42,
  customKey3: { nestedKey: 'nestedValue' }
};
expectType<Record<string, any>>(customOptions);

// Error cases
expectError<ModuleSetupReturn>(null); // Error: null is not an object
expectError<ModuleSetupReturn>(undefined); // Error: undefined is not an object
expectError<ModuleSetupReturn>(123); // Error: number is not an object
expectError<ModuleSetupReturn>('string'); // Error: string is not an object

// Valid values with symbol and function
const validOptionsWithSymbolAndFn: ModuleSetupReturn = {
  key1: Symbol('symbol'),
  key2: () => {}
};
expectType<ModuleSetupReturn>(validOptionsWithSymbolAndFn);
