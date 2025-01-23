import { expectType, expectError } from 'tsd';
import type {
  ModuleContext,
  ModuleDefinition,
  ModuleOptions,
  ModuleSetupReturn
} from '@vuemodule/core';

// Valid ModuleDefinition with meta only
const moduleDefinitionWithMeta: ModuleDefinition = {
  meta: {
    name: 'TestModule',
    version: '1.0.0',
    customKey: 'value'
  }
};
expectType<ModuleDefinition>(moduleDefinitionWithMeta);

// Valid ModuleDefinition with setup function
const moduleDefinitionWithSetup: ModuleDefinition<
  ModuleOptions,
  ModuleSetupReturn
> = {
  meta: { name: 'TestModule' },
  setup: context => {
    expectType<ModuleContext<ModuleOptions>>(context); // Ensure context matches ModuleOptions
    return { key: 'value' }; // Returning a valid object
  }
};
expectType<ModuleDefinition<ModuleOptions, ModuleSetupReturn>>(
  moduleDefinitionWithSetup
);

// Valid ModuleDefinition with async setup function
const moduleDefinitionWithAsyncSetup: ModuleDefinition<
  ModuleOptions,
  ModuleSetupReturn
> = {
  meta: { name: 'AsyncModule' },
  setup: async context => {
    expectType<ModuleContext<ModuleOptions>>(context); // Ensure context matches ModuleOptions
    return Promise.resolve({ key: 'value' }); // Returning a resolved promise
  }
};
expectType<ModuleDefinition<ModuleOptions, ModuleSetupReturn>>(
  moduleDefinitionWithAsyncSetup
);

// Error: invalid meta type
expectError<ModuleDefinition>({
  meta: 'invalidMeta' // Meta should be of type ModuleMeta
});

// Error: setup function with invalid context
expectError<ModuleDefinition<string>>({
  setup: context => {
    expectType<string>(context); // Context should not be a string
    return;
  }
});

// Error: setup function with invalid return type
expectError<ModuleDefinition<ModuleOptions>>({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setup: context => {
    return 123; // Invalid return type
  }
});
