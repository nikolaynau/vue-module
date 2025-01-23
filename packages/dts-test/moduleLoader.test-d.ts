import { expectType, expectError } from 'tsd';
import type { ModuleContext, ModuleLoader } from '@vuemodule/core';

// Valid ModuleLoader with direct ModuleDefinition
const directLoader: ModuleLoader = () => {
  return {
    meta: {
      name: 'testModule',
      version: '1.0.0'
    },
    setup: context => {
      expectType<ModuleContext>(context); // Ensure context is of type ModuleContext
      return;
    }
  };
};
expectType<ModuleLoader>(directLoader);

// Valid ModuleLoader with default export
const defaultLoader: ModuleLoader = () => {
  return {
    default: {
      meta: {
        name: 'defaultModule',
        version: '2.0.0'
      },
      setup: context => {
        expectType<ModuleContext>(context); // Ensure context is of type ModuleContext
        return { key: 'value' };
      }
    }
  };
};
expectType<ModuleLoader>(defaultLoader);

// Async ModuleLoader returning a promise
const asyncLoader: ModuleLoader = async () => {
  return {
    meta: {
      name: 'asyncModule'
    },
    setup: async context => {
      expectType<ModuleContext>(context); // Ensure context is of type ModuleContext
      return Promise.resolve({ key: 'asyncValue' });
    }
  };
};
expectType<ModuleLoader>(asyncLoader);

// Error cases

// Invalid loader: returns an incorrect type
expectError<ModuleLoader>(() => {
  return {
    invalidKey: 'invalid' // Invalid: not a ModuleDefinition
  };
});

// Invalid loader: setup function with invalid context
expectError<ModuleLoader>(() => {
  return {
    meta: {
      name: 'invalidModule'
    },
    setup: context => {
      expectType<string>(context); // Invalid: context is not a string
      return;
    }
  };
});

// Invalid loader: default export with incorrect structure
expectError<ModuleLoader>(() => {
  return {
    default: {
      meta: 'invalidMeta', // Invalid: meta should be ModuleMeta
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      setup: context => {
        return 123; // Invalid: return type should match ModuleSetupReturn
      }
    }
  };
});
