import { describe, it, expect } from 'vitest';
import {
  isModuleInstalled,
  isModuleDisposed,
  isModuleLoader,
  disposeModule,
  getModuleName,
  getModuleVersion,
  getModuleExports,
  getModuleOptions,
  moduleEquals
} from '../src/module';
import {
  type ModuleConfig,
  type ModuleHookConfig,
  type ModuleOptions,
  type ModuleSetupReturn,
  type ResolvedModule
} from '../src/types';

describe('Module utility functions', () => {
  describe('isModuleInstalled', () => {
    it('returns false when config.resolved is undefined', () => {
      const config = {} as ModuleConfig;
      expect(isModuleInstalled(config)).toBe(false);
    });

    it('returns true when config.resolved is defined', () => {
      const config = { resolved: {} } as ModuleConfig;
      expect(isModuleInstalled(config)).toBe(true);
    });
  });

  describe('isModuleDisposed', () => {
    it('returns false when config.resolved is undefined', () => {
      const config = {} as ModuleConfig;
      expect(isModuleDisposed(config)).toBe(false);
    });

    it('returns false when config.resolved.disposed is false or undefined', () => {
      const config = {
        resolved: { disposed: false }
      } as ModuleConfig;
      expect(isModuleDisposed(config)).toBe(false);
    });

    it('returns true when config.resolved.disposed is true', () => {
      const config = {
        resolved: { disposed: true }
      } as ModuleConfig;
      expect(isModuleDisposed(config)).toBe(true);
    });
  });

  describe('getModuleName', () => {
    it('returns the module name if available', () => {
      const config = {
        resolved: { meta: { name: 'test-module' } }
      } as ModuleConfig;
      expect(getModuleName(config)).toBe('test-module');
    });

    it('returns undefined if meta or name is missing', () => {
      const config = { resolved: {} } as ModuleConfig;
      expect(getModuleName(config)).toBeUndefined();
    });
  });

  describe('getModuleVersion', () => {
    it('returns the module version if available', () => {
      const config = {
        resolved: { meta: { version: '1.2.3' } }
      } as ModuleConfig;
      expect(getModuleVersion(config)).toBe('1.2.3');
    });

    it('returns undefined if meta or version is missing', () => {
      const config = { resolved: {} } as ModuleConfig;
      expect(getModuleVersion(config)).toBeUndefined();
    });
  });

  describe('getModuleExports', () => {
    it('returns the module exports if available', () => {
      const exportsValue: ModuleSetupReturn = { foo: 'bar' };
      const config = {
        resolved: { exports: exportsValue }
      } as ModuleConfig;
      expect(getModuleExports(config)).toBe(exportsValue);
    });

    it('returns undefined if exports is missing', () => {
      const config = { resolved: {} } as ModuleConfig;
      expect(getModuleExports(config)).toBeUndefined();
    });
  });

  describe('getModuleOptions', () => {
    it('returns the module options if available', () => {
      const optionsValue: ModuleOptions = { debug: true };
      const config = {
        resolved: { options: optionsValue }
      } as ModuleConfig;
      expect(getModuleOptions(config)).toBe(optionsValue);
    });

    it('returns undefined if options is missing', () => {
      const config = { resolved: {} } as ModuleConfig;
      expect(getModuleOptions(config)).toBeUndefined();
    });
  });

  describe('isModuleLoader', () => {
    it('returns true for functions', () => {
      const loader = () => {};
      expect(isModuleLoader(loader)).toBe(true);
    });

    it('returns false for non-functions', () => {
      expect(isModuleLoader({})).toBe(false);
      expect(isModuleLoader(123)).toBe(false);
      expect(isModuleLoader('loader')).toBe(false);
    });
  });

  describe('moduleEquals', () => {
    it('returns true when both configs are the same object', () => {
      const config = {
        id: 1,
        resolved: {}
      } as ModuleConfig;
      expect(moduleEquals(config, config)).toBe(true);
    });

    it('returns true when both configs have the same id', () => {
      const config1 = {
        id: 1,
        resolved: {}
      } as ModuleConfig;
      const config2 = {
        id: 1,
        resolved: {}
      } as ModuleConfig;
      expect(moduleEquals(config1, config2)).toBe(true);
    });

    it('returns false when one config is undefined', () => {
      const config = {
        id: 1,
        resolved: {}
      } as ModuleConfig;
      expect(moduleEquals(config, undefined)).toBe(false);
    });

    it('returns false when ids are different', () => {
      const config1 = {
        id: 1,
        resolved: {}
      } as ModuleConfig;
      const config2 = {
        id: 2,
        resolved: {}
      } as ModuleConfig;
      expect(moduleEquals(config1, config2)).toBe(false);
    });
  });

  describe('disposeModule', () => {
    it('disposes an installed module that is not already disposed', () => {
      const exports = { a: 1, b: 2 };
      const hooks = [
        {
          key: null,
          type: 'installed',
          callback: () => {}
        }
      ] satisfies ModuleHookConfig[];
      const resolved = {
        disposed: false,
        hooks,
        exports,
        meta: { info: 'meta data' },
        options: { key: 'value' }
      } satisfies ResolvedModule;
      const config = { loader: () => ({}), resolved } as ModuleConfig;

      disposeModule(config);

      expect(resolved.disposed).toBe(true);
      expect(resolved.hooks).toHaveLength(0);
      expect(resolved.exports).toBeUndefined();
      expect(resolved.meta).toBeUndefined();
      expect(resolved.options).toBeUndefined();
      expect(config.resolved).toBeUndefined();
    });

    it('does nothing if the module is not installed', () => {
      const config = { resolved: undefined } as ModuleConfig;
      disposeModule(config);
      expect(config.resolved).toBeUndefined();
    });

    it('does nothing if the module is already disposed', () => {
      const exports = { a: 1, b: 2 };
      const hooks = [
        {
          key: null,
          type: 'installed',
          callback: () => {}
        }
      ] satisfies ModuleHookConfig[];
      const resolved = {
        disposed: true,
        hooks,
        exports,
        meta: { info: 'meta data' },
        options: { key: 'value' }
      } satisfies ResolvedModule;
      const config = { loader: () => ({}), resolved } as ModuleConfig;

      disposeModule(config);

      expect(config.resolved).toBe(resolved);
      expect(resolved.disposed).toBe(true);
      expect(resolved.hooks).toHaveLength(1);
      expect(resolved.exports).toEqual(exports);
      expect(resolved.meta).toEqual({ info: 'meta data' });
      expect(resolved.options).toEqual({ key: 'value' });
    });
  });
});
