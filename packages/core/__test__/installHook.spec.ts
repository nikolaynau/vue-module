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

  it('should return an empty error array if the module is not installed', async () => {
    const spyNull = vi.spyOn(hookModule, 'invokeNullKeyHooks');

    const moduleInstance = {
      isInstalled: false
    } as ModuleInstance;

    const errors = await callInstallHook(moduleInstance);

    expect(errors).toEqual([]);
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

    const errors = await callInstallHook(moduleInstance);

    expect(errors).toEqual([]);
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

    const dependentModule = { isInstalled: true } as ModuleInstance;

    const scope: ModuleScope = {
      modules: {
        toArray: () => [dependentModule],
        isInstalled: () => true,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        get: (value: any) => dependentModule
      } as ModuleManager
    };

    const moduleInstance = {
      isInstalled: true,
      scope
    } as ModuleInstance;

    const errors = await callInstallHook(moduleInstance);

    expect(errors).toEqual([]);

    expect(spyNull).toHaveBeenCalledWith(
      moduleInstance,
      'installed',
      false,
      expect.any(Array)
    );
    expect(spySpecified).toHaveBeenCalledWith(
      moduleInstance,
      dependentModule,
      'installed',
      false,
      expect.any(Array)
    );
    expect(spySpecifiedArray).toHaveBeenCalledWith(
      moduleInstance,
      dependentModule,
      scope,
      'installed',
      false,
      expect.any(Array)
    );
    expect(spyAny).toHaveBeenCalledWith(
      moduleInstance,
      dependentModule,
      'installed',
      false,
      expect.any(Array)
    );
    expect(spyAll).toHaveBeenCalledWith(
      dependentModule,
      scope,
      'installed',
      false,
      expect.any(Array)
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
      async (moduleInstance, hookType, suppressErrors, errors) => {
        errors?.push(testError);
      }
    );

    const moduleInstance = {
      isInstalled: true,
      scope: undefined
    } as ModuleInstance;

    const errors = await callInstallHook(moduleInstance, true);
    expect(errors).toContain(testError);
  });
});
