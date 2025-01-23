import { expectType, expectError } from 'tsd';
import type { ModuleConfig, ModuleContext, ModuleMeta } from '@vuemodule/core';

// Valid ModuleConfig with basic options
const basicConfig: ModuleConfig = {
  options: { key: 'value' },
  enforce: 'pre'
};
expectType<ModuleConfig>(basicConfig);

// Valid ModuleConfig with loader
const configWithLoader: ModuleConfig = {
  loader: () => ({
    meta: { name: 'TestModule', version: '1.0.0' },
    setup: context => {
      expectType<ModuleContext>(context); // Ensure the context is valid
      return { key: 'value' };
    }
  }),
  enforce: 'post'
};
expectType<ModuleConfig>(configWithLoader);

// Valid ModuleConfig with resolved result
const resolvedConfig: ModuleConfig = {
  resolved: {
    options: { key: 'value' },
    exports: { key: 'exportedValue' },
    meta: { name: 'ResolvedModule' },
    hooks: [
      {
        key: 'testHook',
        callback: moduleConfig => {
          expectType<ModuleConfig | ModuleConfig[] | undefined>(moduleConfig);
          return;
        }
      }
    ]
  }
};
expectType<ModuleConfig>(resolvedConfig);

// Valid ModuleConfig with asynchronous options
const asyncOptionsConfig: ModuleConfig = {
  options: async meta => {
    expectType<ModuleMeta | undefined>(meta); // Ensure meta is valid
    return { key: 'asyncValue' };
  }
};
expectType<ModuleConfig>(asyncOptionsConfig);

// Valid ModuleConfig with dependencies
const configWithDeps: ModuleConfig = {
  deps: [
    async () => {
      return 'dependencyResult';
    }
  ]
};
expectType<ModuleConfig>(configWithDeps);

// Error: invalid `enforce` value
expectError<ModuleConfig>({
  enforce: 'invalid' // Invalid: should be 'pre', 'post', or 'fin'
});

// Error: loader returns invalid type
expectError<ModuleConfig>({
  loader: () => {
    return {
      invalidKey: 'value' // Invalid: not a valid ModuleDefinition
    };
  }
});

// Error: invalid resolved options type
expectError<ModuleConfig>({
  resolved: {
    options: 'invalid' // Invalid: should be a ModuleOptions object
  }
});

// Error: invalid dependency type
expectError<ModuleConfig>({
  deps: ['invalidDep'] // Invalid: dependencies must be functions
});

// Error: options with invalid type
expectError<ModuleConfig>({
  options: 123 // Invalid: should be a function or ModuleOptions
});
