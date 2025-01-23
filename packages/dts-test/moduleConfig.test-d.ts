import { expectType, expectError } from 'tsd';
import type { ModuleConfig, ModuleContext, ModuleMeta } from '@vuemodule/core';

// Valid ModuleConfig with basic options
const basicModuleConfig: ModuleConfig = {
  loader: async () => ({
    meta: { name: 'TestModule', version: '1.0.0' },
    setup: async context => {
      expectType<ModuleContext>(context); // Ensure context matches
      return { key: 'value' };
    }
  }),
  options: { key: 'value' },
  enforce: 'pre'
};
expectType<ModuleConfig>(basicModuleConfig);

// Valid ModuleConfig with async options
const asyncOptionsModuleConfig: ModuleConfig = {
  loader: async () => ({
    meta: { name: 'AsyncModule', version: '1.0.0' },
    setup: async context => {
      expectType<ModuleContext>(context); // Ensure context matches
      return;
    }
  }),
  options: async meta => {
    expectType<ModuleMeta | undefined>(meta); // Meta is optional
    return { asyncKey: true };
  }
};
expectType<ModuleConfig>(asyncOptionsModuleConfig);

// Valid ModuleConfig with dependencies
const moduleConfigWithDeps: ModuleConfig = {
  loader: async () => ({
    meta: { name: 'ModuleWithDeps' },
    setup: context => {
      expectType<ModuleContext>(context);
      return false;
    }
  }),
  deps: [
    async () => {
      return 'Dependency resolved';
    }
  ]
};
expectType<ModuleConfig>(moduleConfigWithDeps);

// Valid ModuleConfig with resolved data
const resolvedModuleConfig: ModuleConfig = {
  loader: async () => ({
    meta: { name: 'ResolvedModule' }
  }),
  resolved: {
    options: { resolvedKey: true },
    exports: { key: 'exportValue' },
    meta: { name: 'ResolvedModule', version: '1.0.0' },
    hooks: [
      {
        callback: config => {
          expectType<ModuleConfig | ModuleConfig[] | undefined>(config);
          return;
        }
      }
    ]
  }
};
expectType<ModuleConfig>(resolvedModuleConfig);

// Error cases

// Missing loader
expectError<ModuleConfig>({
  options: { key: 'value' }
});

// Invalid enforce value
expectError<ModuleConfig>({
  loader: async () => ({
    meta: { name: 'InvalidEnforce' }
  }),
  enforce: 'invalidPhase' // Should be 'pre', 'post', or 'fin'
});

// Invalid dependency type
expectError<ModuleConfig>({
  loader: async () => ({
    meta: { name: 'InvalidDep' }
  }),
  deps: ['invalidDependency'] // Dependencies must be functions
});

// Invalid resolved data
expectError<ModuleConfig>({
  loader: async () => ({
    meta: { name: 'InvalidResolved' }
  }),
  resolved: {
    options: 'invalidOptions' // Options must be an object
  }
});

// Invalid options type
expectError<ModuleConfig>({
  loader: async () => ({
    meta: { name: 'InvalidOptions' }
  }),
  options: 123 // Options must be an object or a function
});
