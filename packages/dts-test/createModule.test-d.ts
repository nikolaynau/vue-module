import { expectType, expectError } from 'tsd';
import { createModule } from '@vuemodule/core';
import type { ModuleInstance } from '@vuemodule/core';

// Overload 1: Loader without dependencies
expectType<ModuleInstance>(createModule(() => import('./moduleA')));

// Overload 2: Loader with dependencies
expectType<ModuleInstance>(
  createModule(
    () => import('./moduleA'),
    () => Promise.resolve(),
    () => Promise.resolve()
  )
);

// Overload 3: Loader with options
expectType<ModuleInstance>(
  createModule(() => import('./moduleA'), { foo: 'bar', baz: 123 })
);

// Overload 4: Full configuration
expectType<ModuleInstance>(
  createModule({
    loader: () => import('./moduleA'),
    options: { foo: 'bar' },
    enforce: 'post',
    deps: [() => Promise.resolve(), () => Promise.resolve()]
  })
);

// Check invalid type for options
expectError(
  createModule(() => import('./moduleA'), { foo: 123 }) // Assume `foo` expects a string
);

// Error: Passing invalid configuration
expectError(
  createModule({
    loader: () => import('./moduleA'),
    options: { bar: 123 } // Assume `foo` is a required field
  })
);

// Error: Passing too many arguments
expectError(
  createModule(
    () => import('./moduleA'),
    { foo: 'bar' },
    () => Promise.resolve()
  )
);
