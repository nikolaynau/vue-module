import {
  describe,
  expect,
  it,
  vi,
  beforeEach,
  afterEach,
  type MockInstance
} from 'vitest';
import { ModuleClass } from '../src/modules/moduleInstance';
import * as hooks from '../src/hooks';
import * as loader from '../src/loader';
import * as moduleUtils from '../src/module';
import type {
  ModuleConfig,
  ModuleScope,
  ModuleManager,
  ResolvedModule
} from '../src/types';

describe('ModuleClass', () => {
  const mockManager = {} as ModuleManager;
  const mockScope: ModuleScope = {
    modules: mockManager
  };
  const mockResolved: ResolvedModule = {
    options: { a: 1 },
    exports: { foo: 'bar' },
    meta: { name: 'moduleA', version: '1.0.0' },
    hooks: [
      {
        key: null,
        type: 'installed',
        callback: () => {}
      }
    ],
    disposed: false
  };
  const mockConfig: ModuleConfig = {
    loader: () => ({}),
    resolved: mockResolved,
    scope: mockScope
  };

  let moduleInstance: ModuleClass;

  beforeEach(() => {
    moduleInstance = new ModuleClass(mockConfig);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Getters', () => {
    it('should return correct config', () => {
      expect(moduleInstance.config).toEqual(mockConfig);
    });

    it('should return scope from config', () => {
      expect(moduleInstance.scope).toBe(mockScope);
    });

    it('should return meta from resolved config', () => {
      expect(moduleInstance.meta).toEqual(mockResolved.meta);
    });

    it('should return name from meta', () => {
      expect(moduleInstance.name).toBe('moduleA');
    });

    it('should return version from meta', () => {
      expect(moduleInstance.version).toBe('1.0.0');
    });

    it('should return exports from resolved config', () => {
      expect(moduleInstance.exports).toEqual(mockResolved.exports);
    });

    it('should return options from resolved config', () => {
      expect(moduleInstance.options).toEqual(mockResolved.options);
    });

    it('should return hooks from resolved config', () => {
      expect(moduleInstance.hooks).toEqual(mockResolved.hooks);
    });

    it('should handle undefined resolved config', () => {
      const instance = new ModuleClass({} as ModuleConfig);
      expect(instance.name).toBeUndefined();
      expect(instance.exports).toBeUndefined();
    });
  });

  describe('isInstalled', () => {
    it('should return true when module is installed', () => {
      vi.spyOn(moduleUtils, 'isModuleInstalled').mockReturnValue(true);
      expect(moduleInstance.isInstalled).toBe(true);
    });

    it('should return false when module is not installed', () => {
      vi.spyOn(moduleUtils, 'isModuleInstalled').mockReturnValue(false);
      expect(moduleInstance.isInstalled).toBe(false);
    });
  });

  describe('install()', () => {
    let mockIsModuleInstalled: MockInstance;
    let mockLoadModule: MockInstance;
    let mockCallInstallHook: MockInstance;

    beforeEach(() => {
      mockIsModuleInstalled = vi.spyOn(moduleUtils, 'isModuleInstalled');
      mockLoadModule = vi.spyOn(loader, 'loadModule');
      mockCallInstallHook = vi.spyOn(hooks, 'callInstallHook');

      mockIsModuleInstalled.mockReturnValue(false);
      mockLoadModule.mockResolvedValue(undefined);
      mockCallInstallHook.mockResolvedValue(undefined);
    });

    it('should load module and call install hook when not installed', async () => {
      await moduleInstance.install();

      expect(mockLoadModule).toHaveBeenCalledWith(mockConfig);
      expect(mockCallInstallHook).toHaveBeenCalledWith(
        moduleInstance,
        false,
        []
      );
    });

    it('should not install if already installed', async () => {
      mockIsModuleInstalled.mockReturnValue(true);

      await moduleInstance.install();

      expect(mockLoadModule).not.toHaveBeenCalled();
    });

    it('should handle errors with suppressErrors', async () => {
      const errors: Error[] = [];

      const error = new Error('load error');
      mockLoadModule.mockImplementation(() => {
        errors.push(error);
      });

      await expect(
        moduleInstance.install({ suppressErrors: true, errors })
      ).resolves.not.toThrow();

      expect(errors).toHaveLength(1);
      expect(errors[0].message).toBe('load error');
      expect(mockCallInstallHook).not.toHaveBeenCalled();
    });
  });

  describe('uninstall()', () => {
    let mockIsModuleInstalled: MockInstance;
    let mockCallUninstallHook: MockInstance;
    let mockDisposeModule: MockInstance;

    beforeEach(() => {
      mockIsModuleInstalled = vi.spyOn(moduleUtils, 'isModuleInstalled');
      mockDisposeModule = vi.spyOn(moduleUtils, 'disposeModule');
      mockCallUninstallHook = vi.spyOn(hooks, 'callUninstallHook');

      mockIsModuleInstalled.mockReturnValue(true);
      mockDisposeModule.mockResolvedValue(undefined);
      mockCallUninstallHook.mockResolvedValue(undefined);
    });

    it('should call uninstall hook and dispose module', async () => {
      await moduleInstance.uninstall();
      expect(mockCallUninstallHook).toHaveBeenCalledWith(
        moduleInstance,
        false,
        []
      );
      expect(mockDisposeModule).toHaveBeenCalledWith(mockConfig);
    });

    it('should not uninstall if not installed', async () => {
      mockIsModuleInstalled.mockReturnValue(false);
      await moduleInstance.uninstall();
      expect(mockCallUninstallHook).not.toHaveBeenCalled();
    });

    it('should handle errors with suppressErrors', async () => {
      const errors: Error[] = [];

      const error = new Error('uninstall error');
      mockCallUninstallHook.mockImplementation(() => {
        errors.push(error);
      });

      await expect(
        moduleInstance.uninstall({ suppressErrors: true, errors })
      ).resolves.not.toThrow();

      expect(errors).toHaveLength(1);
      expect(errors[0].message).toBe('uninstall error');
      expect(mockCallUninstallHook).toHaveBeenCalledWith(
        moduleInstance,
        true,
        errors
      );
      expect(mockDisposeModule).not.toHaveBeenCalled();
    });
  });
});
