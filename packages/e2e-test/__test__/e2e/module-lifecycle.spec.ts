import { describe, it, expect, vi, afterEach } from 'vitest';
import { createModule, createModules, defineModule } from '@vuemodule/core';
import type {
  ModuleInstance,
  ModuleLoader,
  ModuleOptions,
  ModuleSetupFunction,
  ModuleSetupReturn
} from '@vuemodule/core';

function createTestLoader<
  T extends ModuleOptions = ModuleOptions,
  R extends ModuleSetupReturn = ModuleSetupReturn
>(
  moduleName: string | undefined,
  setupFn: ModuleSetupFunction<T, R>
): ModuleLoader<T, R> {
  return () =>
    Promise.resolve({
      default: defineModule(moduleName, setupFn)
    });
}

describe('Module Lifecycle', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should install and uninstall a single module', async () => {
    const setupFn = vi.fn().mockImplementation(() => {
      return { bar: 'baz' };
    });

    const moduleLoader = createTestLoader<{ foo: string }, { bar: string }>(
      'moduleA',
      setupFn
    );

    const moduleA = createModule(moduleLoader, { foo: 'bar' });

    await moduleA.install();
    expect(moduleA.exports).toEqual({ bar: 'baz' });
    expect(moduleA.name).toBe('moduleA');
    expect(moduleA.isInstalled).toBe(true);

    await moduleA.uninstall();
    expect(moduleA.exports).toBeUndefined();
    expect(moduleA.isInstalled).toBe(false);

    expect(setupFn).toHaveBeenCalledOnce();
    expect(setupFn).toHaveBeenCalledWith(
      expect.objectContaining({
        options: expect.objectContaining({
          foo: 'bar'
        })
      })
    );
  });

  it('should install and uninstall multiple modules with hooks', async () => {
    const mockInstallHook = vi
      .fn()
      .mockImplementation((instance: ModuleInstance) => {
        expect(instance.isInstalled).toBe(true);
        expect(instance.exports).toEqual({ bar: 'baz' });
      });
    const mockUninstallHook = vi
      .fn()
      .mockImplementation((instance: ModuleInstance) => {
        expect(instance.isInstalled).toBe(true);
        expect(instance.exports).toEqual({ bar: 'baz' });
      });

    const moduleASetup = vi.fn().mockImplementation(() => {
      return { bar: 'baz' };
    });

    const moduleBSetup = vi
      .fn()
      .mockImplementation(({ onInstalled, onUninstall }) => {
        onInstalled('moduleA', mockInstallHook);
        onUninstall('moduleA', mockUninstallHook);
      });

    const moduleALoader = createTestLoader<{ foo?: string }, { bar: string }>(
      'moduleA',
      moduleASetup
    );

    const moduleBLoader = createTestLoader(undefined, moduleBSetup);

    const modules = createModules([
      createModule(moduleALoader),
      createModule(moduleBLoader)
    ]);

    await modules.install();

    const moduleA = modules.get('moduleA')!;
    expect(moduleA).not.toBeUndefined();
    expect(moduleA.exports).toEqual({ bar: 'baz' });
    expect(moduleA.isInstalled).toBe(true);

    const moduleB = modules.getAt(1)!;
    expect(moduleB).not.toBeUndefined();
    expect(moduleB.exports).toBeUndefined();
    expect(moduleB.isInstalled).toBe(true);

    await modules.uninstall();

    expect(moduleA.exports).toBeUndefined();
    expect(moduleA.isInstalled).toBe(false);

    expect(moduleASetup).toHaveBeenCalledOnce();
    expect(moduleBSetup).toHaveBeenCalledOnce();

    expect(mockInstallHook).toHaveBeenCalledOnce();
    expect(mockInstallHook).toHaveBeenCalledWith(moduleA);
    expect(mockUninstallHook).toHaveBeenCalledOnce();
    expect(mockUninstallHook).toHaveBeenCalledWith(moduleA);
  });
});
