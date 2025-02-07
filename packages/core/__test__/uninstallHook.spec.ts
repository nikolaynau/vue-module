import {
  describe,
  it,
  expect,
  vi,
  afterEach,
  type MockInstance,
  beforeEach
} from 'vitest';
import { callUninstallHook } from '../src/hooks/uninstallHook';
import * as hookModule from '../src/hooks/hook';
import * as moduleUtils from '../src/module';
import type { ModuleConfig, ModuleScope } from '../src/types';

describe('callUninstallHook', () => {
  let getModuleName: MockInstance;
  let isModuleInstalled: MockInstance;
  let moduleEquals: MockInstance;

  let getAllModules: MockInstance;
  let invokeSpecKeyHooks: MockInstance;
  let invokeAnyKeyHooks: MockInstance;
  let invokeNullKeyHooks: MockInstance;

  beforeEach(() => {
    getAllModules = vi.spyOn(hookModule, 'getAllModules');
    invokeSpecKeyHooks = vi.spyOn(hookModule, 'invokeSpecKeyHooks');
    invokeAnyKeyHooks = vi.spyOn(hookModule, 'invokeAnyKeyHooks');
    invokeNullKeyHooks = vi.spyOn(hookModule, 'invokeNullKeyHooks');

    getModuleName = vi.spyOn(moduleUtils, 'getModuleName');
    isModuleInstalled = vi.spyOn(moduleUtils, 'isModuleInstalled');
    moduleEquals = vi.spyOn(moduleUtils, 'moduleEquals');
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should do nothing if the module is not installed', async () => {
    const moduleConfig = { scope: {} } as any;
    isModuleInstalled.mockReturnValue(false);

    await callUninstallHook(moduleConfig);

    expect(isModuleInstalled).toHaveBeenCalledWith(moduleConfig);
    expect(invokeNullKeyHooks).not.toHaveBeenCalled();
    expect(invokeSpecKeyHooks).not.toHaveBeenCalled();
    expect(invokeAnyKeyHooks).not.toHaveBeenCalled();
    expect(getAllModules).not.toHaveBeenCalled();
  });

  it('should call invokeNullKeyHooks and exit if no scope is provided', async () => {
    const moduleConfig = {} as ModuleConfig;
    isModuleInstalled.mockReturnValue(true);

    await callUninstallHook(moduleConfig);

    expect(invokeNullKeyHooks).toHaveBeenCalledWith(
      moduleConfig,
      'uninstall',
      false,
      undefined
    );
    expect(invokeSpecKeyHooks).not.toHaveBeenCalled();
    expect(invokeAnyKeyHooks).not.toHaveBeenCalled();
    expect(getAllModules).not.toHaveBeenCalled();
  });

  it('should call dependent hooks when module is installed and scope is provided (no other modules)', async () => {
    const scope = {} as ModuleScope;
    const moduleConfig = { scope } as ModuleConfig;
    isModuleInstalled.mockReturnValue(true);
    getAllModules.mockReturnValue([moduleConfig]);

    await callUninstallHook(moduleConfig);

    expect(invokeNullKeyHooks).toHaveBeenCalledWith(
      moduleConfig,
      'uninstall',
      false,
      undefined
    );

    expect(invokeSpecKeyHooks).toHaveBeenCalledWith(
      moduleConfig,
      scope,
      'uninstall',
      undefined,
      false,
      undefined
    );
    expect(invokeAnyKeyHooks).toHaveBeenCalledWith(
      moduleConfig,
      moduleConfig,
      'uninstall',
      false,
      undefined
    );

    expect(getModuleName).not.toHaveBeenCalled();
    expect(invokeSpecKeyHooks).toHaveBeenCalledTimes(1);
    expect(invokeAnyKeyHooks).toHaveBeenCalledTimes(1);
  });

  it('should call hooks for dependent modules when other modules are installed', async () => {
    const scope = {} as ModuleScope;
    const currentConfig = {
      scope,
      id: 1,
      resolved: { meta: { name: 'module1' } }
    } as ModuleConfig;
    const otherConfig = {
      scope,
      id: 2,
      resolved: { meta: { name: 'module2' } }
    } as ModuleConfig;

    isModuleInstalled.mockImplementation((cfg: ModuleConfig) => !!cfg.resolved);
    moduleEquals.mockImplementation(
      (a: ModuleConfig, b: ModuleConfig) => a.id === b.id
    );
    getModuleName.mockImplementation(
      (cfg: ModuleConfig) => cfg.resolved?.meta?.name
    );
    getAllModules.mockReturnValue([currentConfig, otherConfig]);

    const suppressErrors = false;
    const errors: Error[] = [];

    await callUninstallHook(currentConfig, suppressErrors, errors);

    expect(invokeNullKeyHooks).toHaveBeenCalledWith(
      currentConfig,
      'uninstall',
      suppressErrors,
      errors
    );

    expect(invokeSpecKeyHooks).toHaveBeenCalledWith(
      currentConfig,
      scope,
      'uninstall',
      undefined,
      suppressErrors,
      errors
    );
    expect(invokeAnyKeyHooks).toHaveBeenCalledWith(
      currentConfig,
      currentConfig,
      'uninstall',
      suppressErrors,
      errors
    );

    expect(getModuleName).toHaveBeenCalledWith(currentConfig);
    expect(invokeSpecKeyHooks).toHaveBeenCalledWith(
      otherConfig,
      scope,
      'uninstall',
      'module1',
      suppressErrors,
      errors
    );
    expect(invokeAnyKeyHooks).toHaveBeenCalledWith(
      currentConfig,
      otherConfig,
      'uninstall',
      suppressErrors,
      errors
    );
  });

  it('should catch errors from hook functions and add them to errors array when suppressErrors is true', async () => {
    const scope = {} as ModuleScope;
    const moduleConfig = {
      scope,
      id: 1,
      resolved: { meta: { name: 'module1' } }
    } as ModuleConfig;

    isModuleInstalled.mockReturnValue(true);
    getAllModules.mockReturnValue([moduleConfig]);

    const testError = new Error('Hook error');
    invokeNullKeyHooks.mockImplementation(
      async (_config, hookType, suppressErrors, errors) => {
        if (suppressErrors && errors) {
          errors.push(testError);
        } else {
          throw testError;
        }
      }
    );
    invokeSpecKeyHooks.mockResolvedValue(undefined);
    invokeAnyKeyHooks.mockResolvedValue(undefined);

    const errors: Error[] = [];
    await expect(
      callUninstallHook(moduleConfig, true, errors)
    ).resolves.toBeUndefined();

    expect(errors).toContain(testError);
  });

  it('should propagate error when suppressErrors is false', async () => {
    const scope = {} as ModuleScope;
    const moduleConfig = {
      scope,
      id: 1,
      resolved: { meta: { name: 'module1' } }
    } as ModuleConfig;

    isModuleInstalled.mockReturnValue(true);
    getAllModules.mockReturnValue([moduleConfig]);

    const testError = new Error('Hook error');
    invokeNullKeyHooks.mockImplementation(async () => {
      throw testError;
    });

    invokeSpecKeyHooks.mockResolvedValue(undefined);
    invokeAnyKeyHooks.mockResolvedValue(undefined);

    const errors: Error[] = [];
    await expect(
      callUninstallHook(moduleConfig, false, errors)
    ).rejects.toThrow('Hook error');

    expect(errors).toHaveLength(0);
  });
});
