import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach,
  type MockInstance
} from 'vitest';
import type { ModuleConfig, ModuleInstance, ModuleLoader } from '../src/types';
import { createModule } from '../src/modules/createModule';
import * as loader from '../src/loader';
import * as moduleUtils from '../src/module';
import * as hooks from '../src/hooks';
import * as configUtils from '../src/modules/createConfig';

describe('createModule', () => {
  let callInstallHook: MockInstance;
  let callUninstallHook: MockInstance;

  let loadModule: MockInstance;

  let disposeModule: MockInstance;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let getModuleName: MockInstance;
  let isModuleInstalled: MockInstance;
  let moduleEquals: MockInstance;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let getModuleExports: MockInstance;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let getModuleOptions: MockInstance;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let createConfig: MockInstance;

  const loaderFunction: ModuleLoader = () => Promise.resolve({});

  beforeEach(() => {
    callInstallHook = vi
      .spyOn(hooks, 'callInstallHook')
      .mockResolvedValue(undefined);
    callUninstallHook = vi
      .spyOn(hooks, 'callUninstallHook')
      .mockResolvedValue(undefined);

    loadModule = vi
      .spyOn(loader, 'loadModule')
      .mockImplementation(() => Promise.resolve({} as ModuleConfig));

    disposeModule = vi.spyOn(moduleUtils, 'disposeModule');
    getModuleExports = vi
      .spyOn(moduleUtils, 'getModuleExports')
      .mockImplementation(() => ({ exports: 'dummy' }));
    getModuleName = vi
      .spyOn(moduleUtils, 'getModuleName')
      .mockImplementation(() => 'dummyName');
    getModuleOptions = vi
      .spyOn(moduleUtils, 'getModuleOptions')
      .mockImplementation(() => ({ option: true }));
    isModuleInstalled = vi
      .spyOn(moduleUtils, 'isModuleInstalled')
      .mockReturnValue(false);
    moduleEquals = vi.spyOn(moduleUtils, 'moduleEquals').mockReturnValue(true);

    createConfig = vi
      .spyOn(configUtils, 'createConfig')
      .mockImplementation(() => ({ id: 1, loader: loaderFunction }));
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should return a module instance with all required methods', () => {
    const moduleInstance: ModuleInstance = createModule(() =>
      Promise.resolve({})
    );
    expect(moduleInstance).toHaveProperty('install');
    expect(moduleInstance).toHaveProperty('uninstall');
    expect(moduleInstance).toHaveProperty('isInstalled');
    expect(moduleInstance).toHaveProperty('equals');
    expect(moduleInstance).toHaveProperty('id');
    expect(moduleInstance).toHaveProperty('name');
    expect(moduleInstance).toHaveProperty('exports');
    expect(moduleInstance).toHaveProperty('getOptions');
    expect(moduleInstance).toHaveProperty('callHooks');
    expect(moduleInstance).toHaveProperty('setIgnoreHookErrors');
    expect(moduleInstance).toHaveProperty('getHookErrors');
  });

  it('install() should call loadModule and callInstallHook when the module is not installed', async () => {
    isModuleInstalled.mockReturnValue(false);
    const moduleInstance: ModuleInstance = createModule(() =>
      Promise.resolve({})
    );
    await moduleInstance.install();
    expect(loadModule).toHaveBeenCalled();
    expect(callInstallHook).toHaveBeenCalled();
  });

  it('install() should not call loadModule or callInstallHook if the module is already installed', async () => {
    isModuleInstalled.mockReturnValue(true);
    const moduleInstance: ModuleInstance = createModule(() =>
      Promise.resolve({})
    );
    await moduleInstance.install();
    expect(loadModule).not.toHaveBeenCalled();
    expect(callInstallHook).not.toHaveBeenCalled();
  });

  it('uninstall() should call callUninstallHook and disposeModule when the module is installed', async () => {
    isModuleInstalled.mockReturnValue(true);
    const moduleInstance: ModuleInstance = createModule(() =>
      Promise.resolve({})
    );
    await moduleInstance.uninstall();
    expect(callUninstallHook).toHaveBeenCalled();
    expect(disposeModule).toHaveBeenCalled();
  });

  it('uninstall() should not call callUninstallHook or disposeModule when the module is not installed', async () => {
    isModuleInstalled.mockReturnValue(false);
    const moduleInstance: ModuleInstance = createModule(() =>
      Promise.resolve({})
    );
    await moduleInstance.uninstall();
    expect(callUninstallHook).not.toHaveBeenCalled();
    expect(disposeModule).not.toHaveBeenCalled();
  });

  it('id property should return the module config id', () => {
    const moduleInstance: ModuleInstance = createModule(() =>
      Promise.resolve({})
    );
    expect(moduleInstance.id).toBe(1);
  });

  it('name property should return the module name from getModuleName', () => {
    const moduleInstance: ModuleInstance = createModule(() =>
      Promise.resolve({})
    );
    expect(moduleInstance.name).toBe('dummyName');
  });

  it('exports property should return the module exports from getModuleExports', () => {
    const moduleInstance: ModuleInstance = createModule(() =>
      Promise.resolve({})
    );
    expect(moduleInstance.exports).toEqual({ exports: 'dummy' });
  });

  it('getOptions() should return the module options from getModuleOptions', () => {
    const moduleInstance: ModuleInstance = createModule(() =>
      Promise.resolve({})
    );
    expect(moduleInstance.getOptions()).toEqual({ option: true });
  });

  it('equals() should compare module instances using moduleEquals', () => {
    const moduleInstance: ModuleInstance = createModule(() =>
      Promise.resolve({})
    );
    const otherModule = { config: {} } as ModuleInstance;
    expect(moduleInstance.equals(otherModule as ModuleInstance)).toBe(true);
    expect(moduleEquals).toHaveBeenCalledWith(
      { id: 1, loader: loaderFunction } as ModuleConfig,
      otherModule.config
    );
  });

  it('setIgnoreHookErrors() and getHookErrors() should manage hook error settings', () => {
    const moduleInstance: ModuleInstance = createModule(() =>
      Promise.resolve({})
    );
    moduleInstance.setIgnoreHookErrors(true);
    expect(moduleInstance.getHookErrors()).toEqual([]);
  });
});
