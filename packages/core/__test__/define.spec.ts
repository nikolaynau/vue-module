import { describe, it, expect } from 'vitest';
import { defineModule } from '../src/define';
import type {
  ModuleOptions,
  ModuleSetupFunction,
  ModuleDefinition
} from '../src/types';

describe('defineModule', () => {
  it('should define module with name and setup function', () => {
    const setupFunction: ModuleSetupFunction<ModuleOptions> = () => {
      return { success: true };
    };

    const module = defineModule('testModule', setupFunction);

    expect(module).toEqual({
      meta: { name: 'testModule' },
      setup: setupFunction
    });
  });

  it('should define module with only setup function', () => {
    const setupFunction: ModuleSetupFunction<ModuleOptions> = () => {
      return { success: true };
    };

    const module = defineModule(setupFunction);

    expect(module).toEqual({
      setup: setupFunction
    });
  });

  it('should return the same module definition object', () => {
    const moduleDefinition: ModuleDefinition<ModuleOptions> = {
      meta: { name: 'testModule' },
      setup: () => ({ success: true })
    };

    const module = defineModule(moduleDefinition);

    expect(module).toBe(moduleDefinition);
  });

  it('should handle invalid input gracefully', () => {
    const invalidInput = undefined;

    // @ts-expect-error Invalid input type is expected for testing purposes
    const module = defineModule(invalidInput);

    expect(module).toBeUndefined();
  });

  it('should define module with name undefined and setup function', () => {
    const setupFunction: ModuleSetupFunction<ModuleOptions> = () => {
      return { success: true };
    };

    const module = defineModule(undefined, setupFunction);

    expect(module).toEqual({
      meta: { name: undefined },
      setup: setupFunction
    });
  });

  it('should define module with undefined', () => {
    // @ts-expect-error Invalid input type is expected for testing purposes
    const module = defineModule();

    expect(module).toEqual({
      setup: undefined
    });
  });
});
