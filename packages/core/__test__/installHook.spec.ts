import {
  describe,
  it,
  expect,
  vi,
  afterEach,
  type MockInstance,
  beforeEach
} from 'vitest';
import { callInstallHook } from '../src/hooks/installHook';
import * as hookModule from '../src/hooks/hook';
import * as moduleUtils from '../src/module';
import type { ModuleConfig, ModuleScope } from '../src/types';

describe('callInstallHook', () => {
  let getModuleName: MockInstance;
  let isModuleInstalled: MockInstance;
  let moduleEquals: MockInstance;

  let areAllModulesInstalled: MockInstance;
  let getAllModules: MockInstance;
  let invokeAllKeyHooks: MockInstance;
  let invokeAllSpecKeyHooks: MockInstance;
  let invokeAnyKeyHooks: MockInstance;
  let invokeNullKeyHooks: MockInstance;

  beforeEach(() => {
    areAllModulesInstalled = vi.spyOn(hookModule, 'areAllModulesInstalled');
    getAllModules = vi.spyOn(hookModule, 'getAllModules');
    invokeAllKeyHooks = vi.spyOn(hookModule, 'invokeAllKeyHooks');
    invokeAllSpecKeyHooks = vi.spyOn(hookModule, 'invokeAllSpecKeyHooks');
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
    const moduleConfig = {} as ModuleConfig;
    isModuleInstalled.mockReturnValue(false);

    await callInstallHook(moduleConfig);

    expect(isModuleInstalled).toHaveBeenCalledWith(moduleConfig);
    expect(invokeNullKeyHooks).not.toHaveBeenCalled();
    expect(invokeAllSpecKeyHooks).not.toHaveBeenCalled();
    expect(invokeAnyKeyHooks).not.toHaveBeenCalled();
    expect(invokeAllKeyHooks).not.toHaveBeenCalled();
  });

  it('should call invokeNullKeyHooks and exit if no scope is provided', async () => {
    const moduleConfig = { scope: undefined } as ModuleConfig;
    isModuleInstalled.mockReturnValue(true);

    await callInstallHook(moduleConfig);

    expect(invokeNullKeyHooks).toHaveBeenCalledWith(
      moduleConfig,
      'installed',
      false,
      undefined
    );
    expect(invokeAllSpecKeyHooks).not.toHaveBeenCalled();
    expect(invokeAnyKeyHooks).not.toHaveBeenCalled();
    expect(getAllModules).not.toHaveBeenCalled();
  });

  it('should call dependent hooks when module is installed and scope is provided (no other modules)', async () => {
    const scope = {} as ModuleScope;
    const moduleConfig = { scope } as ModuleConfig;
    isModuleInstalled.mockReturnValue(true);
    getAllModules.mockReturnValue([moduleConfig]);
    areAllModulesInstalled.mockReturnValue(false);

    await callInstallHook(moduleConfig);

    expect(invokeNullKeyHooks).toHaveBeenCalledWith(
      moduleConfig,
      'installed',
      false,
      undefined
    );

    expect(invokeAllSpecKeyHooks).toHaveBeenCalledWith(
      moduleConfig,
      scope,
      'installed',
      undefined,
      false,
      undefined
    );

    expect(invokeAnyKeyHooks).toHaveBeenCalledWith(
      moduleConfig,
      moduleConfig,
      'installed',
      false,
      undefined
    );

    expect(moduleEquals).toHaveBeenCalledWith(moduleConfig, moduleConfig);
    expect(invokeAllKeyHooks).not.toHaveBeenCalled();
  });

  it('should call hooks for dependent modules and invoke all key hooks when all modules are installed', async () => {
    const scope = {} as ModuleScope;
    const config1 = {
      scope,
      id: 1,
      resolved: { meta: { name: 'module1' } }
    } as ModuleConfig;
    const config2 = {
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
    getAllModules.mockReturnValue([config1, config2]);
    areAllModulesInstalled.mockReturnValue(true);

    const suppressErrors = false;
    const errors: Error[] = [];

    await callInstallHook(config1, suppressErrors, errors);

    expect(invokeNullKeyHooks).toHaveBeenCalledWith(
      config1,
      'installed',
      suppressErrors,
      errors
    );

    expect(invokeAllSpecKeyHooks).toHaveBeenCalledWith(
      config1,
      scope,
      'installed',
      undefined,
      suppressErrors,
      errors
    );
    expect(invokeAnyKeyHooks).toHaveBeenCalledWith(
      config1,
      config1,
      'installed',
      suppressErrors,
      errors
    );

    expect(getModuleName).toHaveBeenCalledWith(config1);
    expect(invokeAllSpecKeyHooks).toHaveBeenCalledWith(
      config2,
      scope,
      'installed',
      'module1',
      suppressErrors,
      errors
    );
    expect(invokeAnyKeyHooks).toHaveBeenCalledWith(
      config2,
      config1,
      'installed',
      suppressErrors,
      errors
    );
    expect(invokeAnyKeyHooks).toHaveBeenCalledWith(
      config1,
      config2,
      'installed',
      suppressErrors,
      errors
    );

    expect(invokeAllKeyHooks).toHaveBeenCalledWith(
      config1,
      scope,
      'installed',
      suppressErrors,
      errors
    );
    expect(invokeAllKeyHooks).toHaveBeenCalledWith(
      config2,
      scope,
      'installed',
      suppressErrors,
      errors
    );
  });
});
