import { expectType, expectError } from 'tsd';
import type { ModuleContext } from '@vuemodule/core';

// Valid basic case: default ModuleOptions and valid meta
const basicContext: ModuleContext = {
  options: { key: 'value', otherKey: 123 },
  meta: { name: 'test', version: '1.0.0' }
};
expectType<ModuleContext>(basicContext);

// Valid case with custom keys in meta
const metaWithCustomKeys: ModuleContext = {
  options: { key: 'value' },
  meta: { name: 'module', customKey: true }
};
expectType<ModuleContext>(metaWithCustomKeys);

// Valid case with custom ModuleOptions
type CustomOptions = {
  customOption: string;
  flag: boolean;
};
const customContext: ModuleContext<CustomOptions> = {
  options: { customOption: 'test', flag: true },
  meta: { name: 'customModule' }
};
expectType<ModuleContext<CustomOptions>>(customContext);

// Error: missing meta
expectError<ModuleContext>({
  options: { key: 'value' }
});

// Error: missing options
expectError<ModuleContext>({
  meta: { name: 'test' }
});

// Error: options does not match custom type T
expectError<ModuleContext<CustomOptions>>({
  options: { key: 'invalid' }, // customOption and flag are missing
  meta: { name: 'test' }
});

// Error: meta is of an invalid type
expectError<ModuleContext>({
  options: { key: 'value' },
  meta: 'invalidMeta' // meta must be an object
});

// Valid case: nested objects in options
const nestedOptionsContext: ModuleContext = {
  options: {
    nested: { key: 'value', innerKey: 123 }
  },
  meta: { version: '1.0.0' }
};
expectType<ModuleContext>(nestedOptionsContext);
