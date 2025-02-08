import { describe, it, expect, vi } from 'vitest';
import { createModuleContext } from '../src/context';
import * as moduleUtils from '../src/module';
import * as configUtils from '../src/modules/createModule';
import type {
  InternalModuleContext,
  ModuleContext,
  ModuleInstance,
  ModuleLoadConfig,
  ModuleManager,
  ModuleScope
} from '../src/types';

function createTestContext<T = ModuleContext>(): T {
  return createModuleContext(
    { name: 'test-module', version: '1.0.0' },
    { optionA: true }
  ) as T;
}

describe('createModuleContext', () => {
  it('should create a module context with default metadata and options', () => {
    const context = createTestContext();
    expect(context.meta.name).toBe('test-module');
    expect(context.meta.version).toBe('1.0.0');
    expect(context.options).toEqual({ optionA: true });
  });

  it('should create an empty module context without errors', () => {
    const context = createModuleContext();
    expect(context.meta).toEqual({});
    expect(context.options).toEqual({});
  });

  it('should set the module name correctly', () => {
    const context = createTestContext();
    context.setName('new-name');
    expect(context.meta.name).toBe('new-name');
  });

  it('should set the module version correctly', () => {
    const context = createTestContext();
    context.setVersion('2.0.0');
    expect(context.meta.version).toBe('2.0.0');
  });

  it('should update metadata correctly', () => {
    const context = createTestContext();
    context.setMeta({ description: 'A test module' });
    expect(context.meta.description).toBe('A test module');
  });

  it('should register onInstalled hooks correctly', () => {
    const context = createTestContext<InternalModuleContext>();
    const hookCallback = vi.fn();

    context.onInstalled('test-module', hookCallback);
    expect(context._hooks).toHaveLength(1);
    expect(context._hooks[0].type).toBe('installed');
    expect(context._hooks[0].callback).toBe(hookCallback);
  });

  it('should register onUninstall hooks correctly', () => {
    const context = createTestContext<InternalModuleContext>();
    const hookCallback = vi.fn();

    context.onUninstall('test-module', hookCallback);
    expect(context._hooks).toHaveLength(1);
    expect(context._hooks[0].type).toBe('uninstall');
    expect(context._hooks[0].callback).toBe(hookCallback);
  });

  it('should install the module using scope.modules.install when a scope is provided and the argument is a module instance', async () => {
    const fakeModule = {} as ModuleInstance;

    vi.spyOn(moduleUtils, 'isModuleInstance').mockReturnValue(true);

    const fakeScope = {
      modules: {
        install: vi.fn(() => Promise.resolve())
      } as unknown as ModuleManager
    } as ModuleScope;
    const context = createModuleContext({}, {}, fakeScope);

    const result = await context.installModule(fakeModule);

    expect(fakeScope.modules.install).toHaveBeenCalledWith(fakeModule);
    expect(result).toBe(fakeModule);
  });

  it('should call module.install when no scope is provided and the argument is a module instance', async () => {
    const fakeModule = {
      install: vi.fn(() => Promise.resolve())
    } as unknown as ModuleInstance;

    vi.spyOn(moduleUtils, 'isModuleInstance').mockReturnValue(true);
    const context = createModuleContext();

    const result = await context.installModule(fakeModule);

    expect(fakeModule.install).toHaveBeenCalled();
    expect(result).toBe(fakeModule);
  });

  it('should create a module instance using createModule when the argument is not recognized as a module instance', async () => {
    vi.spyOn(moduleUtils, 'isModuleInstance').mockReturnValue(false);

    const fakeModule = {
      install: vi.fn(() => Promise.resolve())
    } as unknown as ModuleInstance;

    const createModuleSpy = vi
      .spyOn(configUtils, 'createModule')
      .mockReturnValue(fakeModule);
    const context = createModuleContext();

    const loadConfig = {} as ModuleLoadConfig;
    const result = await context.installModule(loadConfig);

    expect(createModuleSpy).toHaveBeenCalledWith(loadConfig);
    expect(fakeModule.install).toHaveBeenCalled();
    expect(result).toBe(fakeModule);
  });

  it('should return the module from scope.modules.get when a scope is provided', () => {
    const fakeModuleInstance = {
      install: vi.fn(() => Promise.resolve())
    } as unknown as ModuleInstance;

    const fakeModules = {
      get: vi.fn((name: string) =>
        name === 'testModule' ? fakeModuleInstance : undefined
      )
    } as unknown as ModuleManager;
    const fakeScope: ModuleScope = { modules: fakeModules };
    const context = createModuleContext({}, {}, fakeScope);

    const result = context.getModule('testModule');

    expect(fakeModules.get).toHaveBeenCalledWith('testModule');
    expect(result).toBe(fakeModuleInstance);
  });

  it('should return undefined when no scope is provided', () => {
    const context = createModuleContext();

    const result = context.getModule('anyModule');

    expect(result).toBeUndefined();
  });
});
