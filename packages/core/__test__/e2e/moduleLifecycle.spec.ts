import { describe, it, expect, vi, afterEach } from 'vitest';
import { createModule, createModules, defineModule } from '../../src';
import type {
  ModuleLoader,
  ModuleOptions,
  ModuleSetupFunction,
  ModuleSetupReturn,
  ResolvedModule
} from '../../src';

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
    expect(moduleA.getExports()).toEqual({ bar: 'baz' });
    expect(moduleA.getName()).toBe('moduleA');
    expect(moduleA.isInstalled()).toBe(true);

    await moduleA.uninstall();
    expect(moduleA.getExports()).toBeUndefined();
    expect(moduleA.isInstalled()).toBe(false);

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
      .mockImplementation((module: ResolvedModule) => {
        expect(module.exports).toEqual({ bar: 'baz' });
      });
    const mockUninstallHook = vi
      .fn()
      .mockImplementation((module: ResolvedModule) => {
        expect(module.exports).toEqual({ bar: 'baz' });
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
    expect(moduleA.getExports()).toEqual({ bar: 'baz' });
    expect(moduleA.isInstalled()).toBe(true);

    const moduleB = modules.getAt(1)!;
    expect(moduleB).not.toBeUndefined();
    expect(moduleB.getExports()).toBeUndefined();
    expect(moduleB.isInstalled()).toBe(true);

    expect(moduleASetup).toHaveBeenCalledOnce();
    expect(moduleBSetup).toHaveBeenCalledOnce();

    expect(mockInstallHook).toHaveBeenCalledOnce();

    await modules.uninstall();

    expect(moduleA.getExports()).toBeUndefined();
    expect(moduleA.isInstalled()).toBe(false);

    expect(mockUninstallHook).toHaveBeenCalledOnce();
  });

  it('should call onInstalled with array when modules are installed', async () => {
    const mockInstallHook = vi
      .fn()
      .mockImplementation(([moduleA, moduleB]: ResolvedModule[]) => {
        expect(moduleA.exports).toEqual({ bar: 'baz' });
        expect(moduleB.exports).toEqual({ a: '1', b: 2 });
      });

    const moduleALoader = createTestLoader<{ foo?: string }, { bar: string }>(
      'moduleA',
      () => ({ bar: 'baz' })
    );
    const moduleBLoader = createTestLoader<
      { foo?: string },
      { a: string; b: number }
    >('moduleB', () => ({ a: '1', b: 2 }));

    const moduleCLoader = createTestLoader<
      { foo?: string },
      { a: string; b: number }
    >('moduleC', ({ onInstalled }) => {
      onInstalled(['moduleA', 'moduleB'], mockInstallHook);
    });

    const moduleA = createModule(moduleALoader);
    const moduleB = createModule(moduleBLoader);
    const moduleC = createModule(moduleCLoader);

    const modules = createModules([moduleB, moduleC, moduleA]);

    await modules.install();

    expect(modules.get('moduleA')).not.toBeUndefined();
    expect(modules.get('moduleA')?.getExports()).toEqual({ bar: 'baz' });
    expect(modules.get('moduleA')?.isInstalled()).toBe(true);

    expect(modules.get('moduleB')).not.toBeUndefined();
    expect(modules.get('moduleB')?.getExports()).toEqual({ a: '1', b: 2 });
    expect(modules.get('moduleB')?.isInstalled()).toBe(true);

    expect(modules.get('moduleC')).not.toBeUndefined();
    expect(modules.get('moduleC')?.getExports()).toBeUndefined();
    expect(modules.get('moduleC')?.isInstalled()).toBe(true);

    expect(mockInstallHook).toHaveBeenCalledOnce();
    expect(mockInstallHook).toHaveBeenCalledWith([
      moduleA.config.resolved,
      moduleB.config.resolved
    ]);
  });
});
