import { describe, it, expect, vi, afterEach } from 'vitest';
import { callUninstallHook } from '../src/hooks/uninstallHook';
import * as hookModule from '../src/hooks/hook';
import {
  type ModuleInstance,
  type ModuleManager,
  type ModuleScope
} from '../src/types';

describe('callUninstallHook', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return undefined if the module is not installed', async () => {
    const spyNull = vi.spyOn(hookModule, 'invokeNullKeyHooks');

    const moduleInstance = {
      isInstalled: false
    } as ModuleInstance;

    const result = await callUninstallHook(moduleInstance);
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
    const spyAny = vi
      .spyOn(hookModule, 'invokeAnyKeyHooks')
      .mockResolvedValue(undefined);

    const moduleInstance = {
      isInstalled: true,
      scope: undefined
    } as ModuleInstance;

    await callUninstallHook(moduleInstance);

    expect(spyNull).toHaveBeenCalledWith(
      moduleInstance,
      'uninstall',
      false,
      undefined
    );
    expect(spySpecified).not.toHaveBeenCalled();
    expect(spyAny).not.toHaveBeenCalled();
  });

  it('should call dependent hook functions when a scope is provided', async () => {
    const spyNull = vi
      .spyOn(hookModule, 'invokeNullKeyHooks')
      .mockResolvedValue(undefined);
    const spySpecified = vi
      .spyOn(hookModule, 'invokeSpecifiedKeyHooks')
      .mockResolvedValue(undefined);
    const spyAny = vi
      .spyOn(hookModule, 'invokeAnyKeyHooks')
      .mockResolvedValue(undefined);

    const depModule = { isInstalled: true } as ModuleInstance;
    const scope: ModuleScope = {
      modules: {
        toArray: () => [depModule]
      } as ModuleManager
    } as any;

    const currentModule = {
      name: 'test-module',
      isInstalled: true,
      scope
    } as ModuleInstance;

    await callUninstallHook(currentModule);

    expect(spyNull).toHaveBeenCalledWith(
      currentModule,
      'uninstall',
      false,
      undefined
    );

    expect(spySpecified).toHaveBeenCalledWith(
      depModule,
      scope,
      'uninstall',
      'test-module',
      false,
      undefined
    );
    expect(spyAny).toHaveBeenCalledWith(
      currentModule,
      depModule,
      'uninstall',
      false,
      undefined
    );
  });

  it('should throw an error if a hook invocation throws when suppressErrors is false', async () => {
    const testError = new Error('Test error');
    vi.spyOn(hookModule, 'invokeNullKeyHooks').mockRejectedValue(testError);

    const currentModule = {
      isInstalled: true,
      scope: undefined
    } as ModuleInstance;

    await expect(callUninstallHook(currentModule)).rejects.toThrow(
      'Test error'
    );
  });

  it('should collect errors in the errors array when suppressErrors is true', async () => {
    const testError = new Error('Test suppressed error');
    vi.spyOn(hookModule, 'invokeNullKeyHooks').mockImplementation(
      async (moduleInstance, hookType, suppressErrors, _errors) => {
        _errors?.push(testError);
      }
    );

    const currentModule = {
      isInstalled: true,
      scope: undefined
    } as ModuleInstance;

    const errors: Error[] = [];
    await callUninstallHook(currentModule, true, errors);
    expect(errors).toEqual([testError]);
  });

  it('should call dependent hook functions for current module', async () => {
    const spySpecified = vi
      .spyOn(hookModule, 'invokeSpecifiedKeyHooks')
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

    await callUninstallHook(currentModule);

    expect(spySpecified).toHaveBeenCalledWith(
      currentModule,
      scope,
      'uninstall',
      undefined,
      false,
      undefined
    );
  });
});
