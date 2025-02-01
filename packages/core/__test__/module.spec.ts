import { describe, it, expect } from 'vitest';
import {
  isModuleInstalled,
  isModuleDisposed,
  isModuleLoader,
  disposeModule
} from '../src/module';
import {
  type ModuleConfig,
  type ModuleHookConfig,
  type ResolvedModule
} from '../src/types';

describe('isModuleInstalled', () => {
  it('returns true when config.resolved is truthy', () => {
    const config = { resolved: {} as ResolvedModule } as ModuleConfig;
    expect(isModuleInstalled(config)).toBe(true);
  });

  it('returns false when config.resolved is undefined', () => {
    const config = { resolved: undefined } as ModuleConfig;
    expect(isModuleInstalled(config)).toBe(false);
  });
});

describe('isModuleDisposed', () => {
  it('returns true when config.resolved.disposed is truthy', () => {
    const config = {
      resolved: { disposed: true, hooks: [] as ModuleHookConfig[] }
    } as ModuleConfig;
    expect(isModuleDisposed(config)).toBe(true);
  });

  it('returns false when config.resolved exists but disposed is falsy', () => {
    const config = {
      resolved: { disposed: false, hooks: [] as ModuleHookConfig[] }
    } as ModuleConfig;
    expect(isModuleDisposed(config)).toBe(false);
  });

  it('returns false when config.resolved is undefined', () => {
    const config = { resolved: undefined } as ModuleConfig;
    expect(isModuleDisposed(config)).toBe(false);
  });
});

describe('isModuleLoader', () => {
  it('returns true when the input is a function', () => {
    const loader = () => {};
    expect(isModuleLoader(loader)).toBe(true);
  });

  it('returns false when the input is not a function', () => {
    expect(isModuleLoader({})).toBe(false);
    expect(isModuleLoader(null)).toBe(false);
    expect(isModuleLoader(123)).toBe(false);
    expect(isModuleLoader('loader')).toBe(false);
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
