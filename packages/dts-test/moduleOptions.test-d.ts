import { expectType, expectError } from 'tsd';
import type { ModuleOptions } from '@vuemodule/core';

// Correct cases for ModuleOptions
const validOptions: ModuleOptions = {
  key1: 'value1', // string
  key2: 123, // number
  key3: true, // boolean
  key4: { nested: 'value' }, // object
  key5: [1, 2, 3], // array
  key6: null, // null (valid as any)
  key7: undefined // undefined (valid as any)
};
expectType<Record<string, any>>(validOptions);

const emptyOptions: ModuleOptions = {};
expectType<Record<string, any>>(emptyOptions);

// Custom keys with nested objects
const customOptions: ModuleOptions = {
  customKey1: 'value',
  customKey2: 42,
  customKey3: { nestedKey: 'nestedValue' }
};
expectType<Record<string, any>>(customOptions);

// Error cases
expectError<ModuleOptions>(null); // Error: null is not an object
expectError<ModuleOptions>(undefined); // Error: undefined is not an object
expectError<ModuleOptions>(123); // Error: number is not an object
expectError<ModuleOptions>('string'); // Error: string is not an object

// Valid values with symbol and function
const validOptionsWithSymbolAndFn: ModuleOptions = {
  key1: Symbol('symbol'),
  key2: () => {}
};
expectType<ModuleOptions>(validOptionsWithSymbolAndFn);
