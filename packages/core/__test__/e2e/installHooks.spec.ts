import { describe, it, expect, vi, afterEach } from 'vitest';
import { createModule, createModules, defineModule } from '../../src';
import type {
  ModuleInstance,
  ModuleLoader,
  ModuleOptions,
  ModuleSetupFunction,
  ModuleSetupReturn
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

describe('Install Hooks', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should call onInstalled with array when modules are installed', async () => {
    const mockInstallHook = vi
      .fn()
      .mockImplementation(([moduleA, moduleB]: ModuleInstance[]) => {
        expect(moduleA.isInstalled).toBe(true);
        expect(moduleB.isInstalled).toBe(true);

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
    expect(modules.get('moduleA')?.exports).toEqual({ bar: 'baz' });
    expect(modules.get('moduleA')?.isInstalled).toBe(true);

    expect(modules.get('moduleB')).not.toBeUndefined();
    expect(modules.get('moduleB')?.exports).toEqual({ a: '1', b: 2 });
    expect(modules.get('moduleB')?.isInstalled).toBe(true);

    expect(modules.get('moduleC')).not.toBeUndefined();
    expect(modules.get('moduleC')?.exports).toBeUndefined();
    expect(modules.get('moduleC')?.isInstalled).toBe(true);

    expect(mockInstallHook).toHaveBeenCalledOnce();
    expect(mockInstallHook).toHaveBeenCalledWith([moduleA, moduleB]);
  });
});
