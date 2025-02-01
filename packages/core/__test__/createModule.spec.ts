import { describe, it, expect, vi, afterEach } from 'vitest';
import { createModule } from '../src/modules/createModule';
import * as createConfig from '../src/modules/createConfig';
import { ModuleClass } from '../src/modules/moduleInstance';
import type { ModuleOptions, ModuleLoadConfig, ModuleDep } from '../src/types';

describe('createModule', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should create a module instance when passed a config object', () => {
    const loadConfig: ModuleLoadConfig = {
      loader: vi.fn(),
      options: { key: 'value' },
      deps: [() => {}]
    };

    const createConfigSpy = vi
      .spyOn(createConfig, 'createConfig')
      .mockReturnValue(loadConfig);

    const moduleInstance = createModule(loadConfig);

    expect(moduleInstance).toBeInstanceOf(ModuleClass);
    expect(createConfigSpy).toHaveBeenCalledWith(loadConfig, undefined);
  });

  it('should create a module instance when passed a loader function only', () => {
    const loader = vi.fn();
    const expectedConfig: ModuleLoadConfig = {
      loader,
      options: undefined,
      deps: []
    };

    const createConfigSpy = vi
      .spyOn(createConfig, 'createConfig')
      .mockReturnValue(expectedConfig);

    const moduleInstance = createModule(loader);

    expect(moduleInstance).toBeInstanceOf(ModuleClass);
    expect(createConfigSpy).toHaveBeenCalledWith(loader, undefined);
  });

  it('should create a module instance when passed a loader and options', () => {
    const loader = vi.fn();
    const options: ModuleOptions = { foo: 'bar' };
    const expectedConfig: ModuleLoadConfig = {
      loader: loader,
      options: options,
      deps: []
    };

    const createConfigSpy = vi
      .spyOn(createConfig, 'createConfig')
      .mockReturnValue(expectedConfig);

    const moduleInstance = createModule(loader, options);

    expect(moduleInstance).toBeInstanceOf(ModuleClass);
    expect(createConfigSpy).toHaveBeenCalledWith(loader, options);
  });

  it('should create a module instance when passed a loader and dependencies', () => {
    const loader = vi.fn();
    const dep1: ModuleDep = () => {};
    const dep2: ModuleDep = () => {};
    const expectedConfig: ModuleLoadConfig = {
      loader: loader,
      options: undefined,
      deps: [dep1, dep2]
    };

    const createConfigSpy = vi
      .spyOn(createConfig, 'createConfig')
      .mockReturnValue(expectedConfig);

    const moduleInstance = createModule(loader, dep1, dep2);

    expect(moduleInstance).toBeInstanceOf(ModuleClass);
    expect(createConfigSpy).toHaveBeenCalledWith(loader, dep1, dep2);
  });
});
