import { describe, it, expect, vi } from 'vitest';
import { loadModule } from '../src/loader';
import type { ModuleConfig, ModuleContext, ModuleLoader } from '../src/types';

describe('loadModule', () => {
  it('should return the config if the loader is invalid', async () => {
    const config: any = { loader: undefined };
    const result = await loadModule(config);
    expect(result).toBe(config);
  });

  it('should return the config if module definition cannot be loaded', async () => {
    const loader = vi.fn(async () => undefined);
    const config: ModuleConfig = { loader: loader as ModuleLoader };
    const result = await loadModule(config);
    expect(result).toBe(config);
    expect(loader).toHaveBeenCalled();
  });

  it('should return the config if setup function is invalid', async () => {
    const loader = vi.fn(async () => ({ default: {} }));
    const config: ModuleConfig = { loader: loader as ModuleLoader };
    const result = await loadModule(config);
    expect(result).toBe(config);
  });

  it('should call the setup function and resolve the module', async () => {
    const setup = vi.fn(async () => ({ foo: 'bar' }));
    const loader = vi.fn(async () => ({
      default: { setup, meta: { name: 'test-module' } }
    }));
    const config: ModuleConfig<{ testOption: boolean }, { foo: string }> = {
      loader,
      options: { testOption: true }
    };

    const result = await loadModule(config);

    expect(loader).toHaveBeenCalled();
    expect(setup).toHaveBeenCalled();
    expect(result).toHaveProperty('resolved');
    expect(result.resolved).toEqual({
      options: { testOption: true },
      exports: { foo: 'bar' },
      meta: { name: 'test-module' },
      hooks: [],
      disposed: false
    });
  });

  it('should handle options as a function', async () => {
    const setup = vi.fn(async () => ({ foo: 'bar' }));
    const loader = vi.fn(async () => ({
      default: { setup, meta: { name: 'test-module' } }
    }));
    const options = vi.fn(async () => ({ dynamicOption: true }));
    const config: ModuleConfig = { loader, options };

    const result = await loadModule(config);

    expect(options).toHaveBeenCalled();
    expect(result.resolved).toHaveProperty('options.dynamicOption', true);
  });

  it('should not resolve the module if setup returns false', async () => {
    const setup = vi.fn(async () => false);
    const loader = vi.fn(async () => ({
      default: { setup, meta: { name: 'test-module' } }
    }));
    const config: ModuleConfig = { loader, options: {} };

    const result = await loadModule(config);

    expect(result.resolved).toBeUndefined();
  });

  it('should set version and name inside setup', async () => {
    const setup = vi.fn(async (ctx: ModuleContext) => {
      ctx.setVersion('1.1.0');
      ctx.setName('new-test-module');
    });
    const loader = vi.fn(async () => ({
      setup,
      meta: { name: 'test-module' }
    }));
    const config: ModuleConfig = { loader };

    const result = await loadModule(config);

    expect(loader).toHaveBeenCalled();
    expect(setup).toHaveBeenCalled();
    expect(result).toHaveProperty('resolved');
    expect(result.resolved).toEqual({
      options: {},
      exports: undefined,
      meta: { name: 'new-test-module', version: '1.1.0' },
      hooks: [],
      disposed: false
    });
  });

  it('should set meta inside setup', async () => {
    const setup = vi.fn(async (ctx: ModuleContext) => {
      ctx.setVersion('1.1.0');
      ctx.setMeta({ name: 'new-test-module', foo: 'bar' });
    });
    const loader = vi.fn(async () => ({
      setup,
      meta: { name: 'test-module' }
    }));
    const config: ModuleConfig = { loader };

    const result = await loadModule(config);

    expect(loader).toHaveBeenCalled();
    expect(setup).toHaveBeenCalled();
    expect(result).toHaveProperty('resolved');
    expect(result.resolved).toEqual({
      options: {},
      exports: undefined,
      meta: { name: 'new-test-module', version: '1.1.0', foo: 'bar' },
      hooks: [],
      disposed: false
    });
  });

  it('should set hooks inside setup', async () => {
    const moduleAInstallHook = () => {};
    const moduleBInstallHook = () => {};
    const moduleUninstallHook = () => {};

    const setup = vi.fn(async (ctx: ModuleContext) => {
      ctx.onInstalled('module-a', moduleAInstallHook);
      ctx.onInstalled('module-b', moduleBInstallHook);
      ctx.onUninstall(moduleUninstallHook);
    });
    const loader = vi.fn(async () => ({
      setup
    }));
    const config: ModuleConfig = { loader };

    const result = await loadModule(config);

    expect(loader).toHaveBeenCalled();
    expect(setup).toHaveBeenCalled();
    expect(result).toHaveProperty('resolved');
    expect(result.resolved).toEqual({
      options: {},
      exports: undefined,
      meta: {},
      hooks: [
        {
          key: 'module-a',
          type: 'installed',
          callback: moduleAInstallHook
        },
        {
          key: 'module-b',
          type: 'installed',
          callback: moduleBInstallHook
        },
        {
          key: null,
          type: 'uninstall',
          callback: moduleUninstallHook
        }
      ],
      disposed: false
    });
  });
});
