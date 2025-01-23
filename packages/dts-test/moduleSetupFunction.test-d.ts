/* eslint-disable @typescript-eslint/no-unused-vars */
import { expectType, expectError } from 'tsd';
import type {
  ModuleSetupFunction,
  ModuleContext,
  ModuleOptions,
  ModuleSetupReturn
} from '@vuemodule/core';

// Basic valid setup function returning void
const setupFunctionVoid: ModuleSetupFunction = context => {
  expectType<ModuleContext>(context); // Ensure context is of type ModuleContext
  return;
};
expectType<ModuleSetupFunction>(setupFunctionVoid);

// Valid setup function returning false
const setupFunctionFalse: ModuleSetupFunction = context => {
  expectType<ModuleContext>(context); // Ensure context is of type ModuleContext
  return false;
};
expectType<ModuleSetupFunction>(setupFunctionFalse);

// Valid setup function returning a result object
const setupFunctionWithReturn: ModuleSetupFunction<
  ModuleOptions,
  ModuleSetupReturn
> = context => {
  expectType<ModuleContext<ModuleOptions>>(context); // Ensure context matches ModuleOptions
  return { key: 'value' }; // Returning a valid object
};
expectType<ModuleSetupFunction<ModuleOptions, ModuleSetupReturn>>(
  setupFunctionWithReturn
);

// Valid setup function returning a Promise
const setupFunctionPromise: ModuleSetupFunction<
  ModuleOptions,
  ModuleSetupReturn
> = async context => {
  expectType<ModuleContext<ModuleOptions>>(context); // Ensure context matches ModuleOptions
  return Promise.resolve({ key: 'value' }); // Returning a resolved promise
};
expectType<ModuleSetupFunction<ModuleOptions, ModuleSetupReturn>>(
  setupFunctionPromise
);

// Error: invalid context type
expectError<ModuleSetupFunction<string>>(context => {
  expectType<string>(context); // Context should not be a string
  return;
});

// Error: invalid return type
expectError<ModuleSetupFunction>(context => {
  return 123; // Invalid return type
});

// Custom ModuleOptions and ModuleSetupReturn types
interface CustomModuleOptions extends ModuleOptions {
  customKey: string;
  isEnabled: boolean;
}

interface CustomModuleSetupReturn extends ModuleSetupReturn {
  result: string;
  config: { timeout: number };
}

// Valid setup function with custom options and return type
const customSetupFunction: ModuleSetupFunction<
  CustomModuleOptions,
  CustomModuleSetupReturn
> = context => {
  expectType<ModuleContext<CustomModuleOptions>>(context); // Ensure context matches custom options
  expectType<string>(context.options.customKey); // Custom key in options
  expectType<boolean>(context.options.isEnabled); // Custom boolean in options
  return {
    result: 'success',
    config: { timeout: 1000 }
  }; // Valid custom return object
};
expectType<ModuleSetupFunction<CustomModuleOptions, CustomModuleSetupReturn>>(
  customSetupFunction
);

// Valid async setup function with custom options and return type
const asyncCustomSetupFunction: ModuleSetupFunction<
  CustomModuleOptions,
  CustomModuleSetupReturn
> = async context => {
  expectType<ModuleContext<CustomModuleOptions>>(context); // Ensure context matches custom options
  return Promise.resolve({
    result: 'async-success',
    config: { timeout: 2000 }
  }); // Valid resolved promise
};
expectType<ModuleSetupFunction<CustomModuleOptions, CustomModuleSetupReturn>>(
  asyncCustomSetupFunction
);

// Error: invalid return type
expectError<ModuleSetupFunction<CustomModuleOptions, CustomModuleSetupReturn>>(
  context => {
    return {
      result: 123, // Invalid type for result
      config: { timeout: '1000' } // Invalid type for timeout
    };
  }
);

// Error: missing fields in the custom return object
expectError<ModuleSetupFunction<CustomModuleOptions, CustomModuleSetupReturn>>(
  context => {
    return {
      result: 'partial' // Missing config property
    };
  }
);
