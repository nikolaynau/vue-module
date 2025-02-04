import { describe, it, expect, vi, afterEach } from 'vitest';
import { callInstallHook } from '../src/hooks/installHook';
import * as hookModule from '../src/hooks/hook';
import {
  type ModuleInstance,
  type ModuleManager,
  type ModuleScope
} from '../src/types';

describe('callInstallHook', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return undefined if the module is not installed', async () => {
    const spyNull = vi.spyOn(hookModule, 'invokeNullKeyHooks');

    const moduleInstance = {
      isInstalled: false
    } as ModuleInstance;

    const result = await callInstallHook(moduleInstance);

    expect(result).toBeUndefined();
    expect(spyNull).not.toHaveBeenCalled();
  });

  it('should call invokeNullKeyHooks and skip dependent hooks when scope is not provided', async () => {
    const spyNull = vi
      .spyOn(hookModule, 'invokeNullKeyHooks')
      .mockResolvedValue(undefined);
    const spySpecified = vi
      .spyOn(hookModule, 'invokeSpecifiedKeyHooks')
      .mockResolvedValue(undefined);
    const spySpecifiedArray = vi
      .spyOn(hookModule, 'invokeSpecifiedKeyArrayHooks')
      .mockResolvedValue(undefined);
    const spyAny = vi
      .spyOn(hookModule, 'invokeAnyKeyHooks')
      .mockResolvedValue(undefined);
    const spyAll = vi
      .spyOn(hookModule, 'invokeAllKeyHooks')
      .mockResolvedValue(undefined);

    const moduleInstance = {
      isInstalled: true,
      scope: undefined
    } as ModuleInstance;

    await callInstallHook(moduleInstance);

    expect(spyNull).toHaveBeenCalledTimes(1);
    expect(spySpecified).not.toHaveBeenCalled();
    expect(spySpecifiedArray).not.toHaveBeenCalled();
    expect(spyAny).not.toHaveBeenCalled();
    expect(spyAll).not.toHaveBeenCalled();
  });

  it('should call all dependent hook functions when a scope is provided', async () => {
    const spyNull = vi
      .spyOn(hookModule, 'invokeNullKeyHooks')
      .mockResolvedValue(undefined);
    const spyAllSpecified = vi
      .spyOn(hookModule, 'invokeAllSpecifiedKeyHooks')
      .mockResolvedValue(undefined);
    const spyAny = vi
      .spyOn(hookModule, 'invokeAnyKeyHooks')
      .mockResolvedValue(undefined);
    const spyAll = vi
      .spyOn(hookModule, 'invokeAllKeyHooks')
      .mockResolvedValue(undefined);

    const dependentModule = { isInstalled: true } as ModuleInstance;

    const scope: ModuleScope = {
      modules: {
        toArray: () => [dependentModule],
        isInstalled: () => true,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        get: (value: any) => dependentModule
      } as ModuleManager
    };

    const currentModule = {
      name: 'test-module',
      isInstalled: true,
      scope
    } as ModuleInstance;

    await callInstallHook(currentModule);

    expect(spyNull).toHaveBeenCalledWith(
      currentModule,
      'installed',
      false,
      undefined
    );
    expect(spyAllSpecified).toHaveBeenCalledWith(
      dependentModule,
      scope,
      'installed',
      'test-module',
      false,
      undefined
    );
    expect(spyAny).toHaveBeenCalledWith(
      currentModule,
      dependentModule,
      'installed',
      false,
      undefined
    );
    expect(spyAll).toHaveBeenCalledWith(
      dependentModule,
      scope,
      'installed',
      false,
      undefined
    );
  });

  it('should throw an error if a hook invocation throws when suppressErrors is false', async () => {
    const testError = new Error('Test error');
    vi.spyOn(hookModule, 'invokeNullKeyHooks').mockRejectedValue(testError);

    const moduleInstance = {
      isInstalled: true,
      scope: undefined
    } as any;

    await expect(callInstallHook(moduleInstance)).rejects.toThrow('Test error');
  });

  it('should collect errors in the errors array when suppressErrors is true', async () => {
    const testError = new Error('Test suppressed error');
    vi.spyOn(hookModule, 'invokeNullKeyHooks').mockImplementation(
      async (moduleInstance, hookType, suppressErrors, _errors) => {
        _errors?.push(testError);
      }
    );

    const moduleInstance = {
      isInstalled: true,
      scope: undefined
    } as ModuleInstance;

    const errors: Error[] = [];
    await callInstallHook(moduleInstance, true, errors);
    expect(errors).toEqual([testError]);
  });

  it('should call all dependent hook functions for current module', async () => {
    const spyAllSpecified = vi
      .spyOn(hookModule, 'invokeAllSpecifiedKeyHooks')
      .mockResolvedValue(undefined);

    const modules: ModuleInstance[] = [];
    const scope: ModuleScope = {
      modules: {
        toArray: () => modules
      } as ModuleManager
    } as any;

    const currentModule = {
      name: 'test-module',
      isInstalled: true,
      scope
    } as ModuleInstance;
    modules.push(currentModule);

    await callInstallHook(currentModule);

    expect(spyAllSpecified).toHaveBeenCalledWith(
      currentModule,
      scope,
      'installed',
      undefined,
      false,
      undefined
    );
  });
});
