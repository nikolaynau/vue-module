import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  createModule,
  createModules,
  defineModule,
  ModuleHookKey
} from '../../src';
import type {
  ModuleConfig,
  ModuleInstance,
  ModuleOptions,
  ModuleSetupFunction,
  ModuleSetupReturn
} from '../../src';

type TestModuleName = 'moduleA' | 'moduleB' | 'moduleC';

function createTestModule<
  T extends ModuleOptions = ModuleOptions,
  R extends ModuleSetupReturn = ModuleSetupReturn
>(
  moduleName: string | undefined,
  setupFn: ModuleSetupFunction<T, R>
): ModuleInstance<T, R> {
  const loader = () =>
    Promise.resolve({
      default: defineModule(moduleName, setupFn)
    });
  return createModule(loader);
}

function createInstallHookTestCase(
  curr: TestModuleName,
  dep1: TestModuleName,
  dep2: TestModuleName
) {
  const nullKeyHook = vi.fn();
  const specCurrKeyHook = vi.fn();
  const specDep1KeyHook = vi.fn();
  const specDep2KeyHook = vi.fn();

  const specArrDep1Dep2KeyHook = vi.fn();
  const specArrCurrDep1Dep2KeyHook = vi.fn();
  const specArrCurrDep1KeyHook = vi.fn();
  const specArrCurrDep2KeyHook = vi.fn();

  const anyKeyHook = vi.fn();
  const allKeyHook = vi.fn();

  const setupFn = vi.fn().mockImplementation(({ onInstalled }) => {
    onInstalled(nullKeyHook);

    onInstalled(curr, specCurrKeyHook);
    onInstalled(dep1, specDep1KeyHook);
    onInstalled(dep2, specDep2KeyHook);

    onInstalled([dep1, dep2], specArrDep1Dep2KeyHook);
    onInstalled([curr, dep1, dep2], specArrCurrDep1Dep2KeyHook);
    onInstalled([curr, dep1], specArrCurrDep1KeyHook);
    onInstalled([curr, dep2], specArrCurrDep2KeyHook);

    onInstalled(ModuleHookKey.Any, anyKeyHook);
    onInstalled(ModuleHookKey.All, allKeyHook);
  });

  const testModule = createTestModule(curr, setupFn);

  return {
    testModule,
    setupFn,
    nullKeyHook,
    specCurrKeyHook,
    specDep1KeyHook,
    specDep2KeyHook,
    specArrDep1Dep2KeyHook,
    specArrCurrDep1Dep2KeyHook,
    specArrCurrDep1KeyHook,
    specArrCurrDep2KeyHook,
    anyKeyHook,
    allKeyHook
  };
}

function createUninstallHookTestCase(
  curr: TestModuleName,
  dep1: TestModuleName,
  dep2: TestModuleName
) {
  const anyCalls: string[] = [];

  const nullKeyHook = vi.fn().mockImplementation(module => {
    expect(module.resolved.meta.name).toBe(curr);
  });
  const specCurrKeyHook = vi.fn().mockImplementation(module => {
    expect(module.resolved.meta.name).toBe(curr);
  });
  const specDep1KeyHook = vi.fn().mockImplementation(module => {
    expect(module.resolved.meta.name).toBe(dep1);
  });
  const specDep2KeyHook = vi.fn().mockImplementation(module => {
    expect(module.resolved.meta.name).toBe(dep2);
  });

  const anyKeyHook = vi.fn().mockImplementation(module => {
    expect([curr, dep1, dep2].includes(module.resolved.meta.name)).toBe(true);
  });

  const setupFn = vi.fn().mockImplementation(({ onUninstall }) => {
    onUninstall(nullKeyHook);

    onUninstall(curr, specCurrKeyHook);
    onUninstall(dep1, specDep1KeyHook);
    onUninstall(dep2, specDep2KeyHook);

    onUninstall(ModuleHookKey.Any, anyKeyHook);
  });

  const testModule = createTestModule(curr, setupFn);

  return {
    testModule,
    setupFn,
    nullKeyHook,
    specCurrKeyHook,
    specDep1KeyHook,
    specDep2KeyHook,
    anyKeyHook,
    anyCalls
  };
}

describe('Hooks', () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Install Hooks', () => {
    it('should call onInstalled with array when modules are installed', async () => {
      const mockInstallHook = vi
        .fn()
        .mockImplementation(([moduleA, moduleB]: ModuleConfig[]) => {
          expect(moduleA.resolved?.exports).toEqual({ bar: 'baz' });
          expect(moduleB.resolved?.exports).toEqual({ a: '1', b: 2 });
        });

      const moduleA = createTestModule<{ foo?: string }, { bar: string }>(
        'moduleA',
        () => ({ bar: 'baz' })
      );
      const moduleB = createTestModule<
        { foo?: string },
        { a: string; b: number }
      >('moduleB', () => ({ a: '1', b: 2 }));

      const moduleC = createTestModule('moduleC', ({ onInstalled }) => {
        onInstalled(['moduleA', 'moduleB'], mockInstallHook);
      });

      const modules = createModules([moduleB, moduleC, moduleA]);

      await modules.install();

      expect(modules.get('moduleA')).not.toBeUndefined();
      expect(modules.get('moduleA')?.exports).toEqual({ bar: 'baz' });
      expect(modules.get('moduleA')?.isInstalled()).toBe(true);

      expect(modules.get('moduleB')).not.toBeUndefined();
      expect(modules.get('moduleB')?.exports).toEqual({ a: '1', b: 2 });
      expect(modules.get('moduleB')?.isInstalled()).toBe(true);

      expect(modules.get('moduleC')).not.toBeUndefined();
      expect(modules.get('moduleC')?.exports).toBeUndefined();
      expect(modules.get('moduleC')?.isInstalled()).toBe(true);

      expect(mockInstallHook).toHaveBeenCalledOnce();
      expect(mockInstallHook).toHaveBeenCalledWith([
        moduleA.config,
        moduleB.config
      ]);
    });

    it.each([
      [1, 2, 3, false],
      [1, 3, 2, false],
      [2, 1, 3, false],
      [2, 3, 1, false],
      [3, 1, 2, false],
      [3, 2, 1, false],
      [1, 2, 3, true],
      [1, 3, 2, true],
      [2, 1, 3, true],
      [2, 3, 1, true],
      [3, 1, 2, true],
      [3, 2, 1, true]
    ])(
      'calls all installed hooks when modules are installed sequentially in different orders',
      async (a1, a2, a3, parallel) => {
        const moduleA = createInstallHookTestCase(
          'moduleA',
          'moduleB',
          'moduleC'
        );
        const moduleB = createInstallHookTestCase(
          'moduleB',
          'moduleA',
          'moduleC'
        );
        const moduleC = createInstallHookTestCase(
          'moduleC',
          'moduleA',
          'moduleB'
        );

        const inputArray = [
          moduleA.testModule,
          moduleB.testModule,
          moduleC.testModule
        ];
        const modules = createModules([
          inputArray[a1 - 1],
          inputArray[a2 - 1],
          inputArray[a3 - 1]
        ]);

        await modules.install(undefined, { parallel });

        verifyInstallModuleHooks(moduleA, moduleB, moduleC);
        verifyInstallModuleHooks(moduleB, moduleA, moduleC);
        verifyInstallModuleHooks(moduleC, moduleA, moduleB);
      }
    );

    it('manual hook invocation after module installation and adding to scope', async () => {
      const moduleBDepAHook = vi.fn();

      const moduleA = createTestModule('moduleA', () => {});
      const moduleB = createTestModule('moduleB', ctx => {
        ctx.onInstalled('moduleA', moduleBDepAHook);
      });

      const modules = createModules([moduleB]);

      await modules.install();

      expect(moduleBDepAHook).not.toHaveBeenCalled();

      await moduleA.install();

      expect(moduleBDepAHook).not.toHaveBeenCalled();

      modules.add(moduleA);

      expect(moduleBDepAHook).not.toHaveBeenCalled();

      await moduleA.callHooks('installed');

      expect(moduleBDepAHook).toHaveBeenCalled();
    });

    it('should call hooks if the module is installed after creating the scope', async () => {
      const moduleBDepAHook = vi.fn();

      const moduleA = createTestModule('moduleA', () => {});
      const moduleB = createTestModule('moduleB', ctx => {
        ctx.onInstalled('moduleA', moduleBDepAHook);
      });

      const modules = createModules([moduleB]);

      await modules.install();

      expect(moduleBDepAHook).not.toHaveBeenCalled();

      await modules.install(moduleA);

      expect(moduleBDepAHook).toHaveBeenCalled();
    });

    it('after module installation, hooks can access the module by name through context', async () => {
      const moduleA = createTestModule('moduleA', ctx => {
        ctx.onInstalled(() => {
          expect(ctx.getModule('moduleA')).not.toBeUndefined();
          expect(ctx.getModule('moduleA')?.name).toBe('moduleA');
        });
      });

      const moduleB = createTestModule('moduleB', ctx => {
        ctx.onInstalled('moduleA', () => {
          expect(ctx.getModule('moduleA')).not.toBeUndefined();
          expect(ctx.getModule('moduleB')).not.toBeUndefined();
          expect(ctx.getModule('moduleA')?.name).toBe('moduleA');
          expect(ctx.getModule('moduleB')?.name).toBe('moduleB');
        });
      });

      const modules = createModules([moduleA, moduleB]);

      await modules.install();

      expect.assertions(6);
    });

    it('module installation inside the setup function', async () => {
      const moduleADepBHook = vi.fn();
      const moduleBDepAHook = vi.fn();

      const moduleA = createTestModule('moduleA', ctx => {
        ctx.onInstalled('moduleB', moduleADepBHook);
      });
      const moduleB = createTestModule('moduleB', async ctx => {
        await ctx.installModule(moduleA);

        ctx.onInstalled('moduleA', moduleBDepAHook);
      });

      const modules = createModules([moduleB]);

      await modules.install();

      expect(moduleADepBHook).toHaveBeenCalledOnce();
      expect(moduleBDepAHook).toHaveBeenCalledOnce();
    });

    it('module installation inside hooks', async () => {
      const moduleADepBHook = vi.fn();
      const moduleADepCHook = vi.fn();

      const moduleBDepAHook = vi.fn();
      const moduleBDepCHook = vi.fn();

      const moduleCDepAHook = vi.fn();
      const moduleCDepBHook = vi.fn();

      const moduleA = createTestModule('moduleA', ctx => {
        ctx.onInstalled('moduleB', moduleADepBHook);
        ctx.onInstalled('moduleC', moduleADepCHook);
      });

      const moduleB = createTestModule('moduleB', ctx => {
        ctx.onInstalled('moduleA', moduleBDepAHook);
        ctx.onInstalled('moduleC', moduleBDepCHook);
      });

      const moduleC = createTestModule('moduleC', ctx => {
        ctx.onInstalled('moduleB', async () => {
          moduleCDepBHook();
          await ctx.installModule(moduleA);
        });

        ctx.onInstalled('moduleA', moduleCDepAHook);
      });

      const modules = createModules([moduleB, moduleC]);

      await modules.install();

      expect(moduleADepBHook).toHaveBeenCalledOnce();
      expect(moduleADepCHook).toHaveBeenCalledOnce();
      expect(moduleBDepAHook).toHaveBeenCalledOnce();
      expect(moduleBDepCHook).toHaveBeenCalledOnce();
      expect(moduleCDepAHook).toHaveBeenCalledOnce();
      expect(moduleCDepBHook).toHaveBeenCalledOnce();
    });
  });

  describe('Uninstal Hooks', () => {
    it('should call onUninstall', async () => {
      const any: { name: string; exports: any }[] = [];

      const mockUninstallAHook = vi.fn().mockImplementation(moduleA => {
        expect(moduleA.resolved.exports).toEqual({ bar: 'baz' });
      });
      const mockUninstallBHook = vi.fn().mockImplementation(moduleB => {
        expect(moduleB.resolved.exports).toEqual({ a: '1', b: 2 });
      });
      const mockUninstallAnyHook = vi.fn().mockImplementation(module => {
        any.push({
          name: module.resolved.meta.name,
          exports: { ...module.resolved.exports }
        });
      });
      const mockUninstallHook = vi.fn().mockImplementation(moduleC => {
        expect(moduleC.exports).toBeUndefined();
      });

      const moduleA = createTestModule<{ foo?: string }, { bar: string }>(
        'moduleA',
        () => ({ bar: 'baz' })
      );
      const moduleB = createTestModule<
        { foo?: string },
        { a: string; b: number }
      >('moduleB', () => ({ a: '1', b: 2 }));

      const moduleC = createTestModule('moduleC', ({ onUninstall }) => {
        onUninstall(mockUninstallHook);
        onUninstall('moduleA', mockUninstallAHook);
        onUninstall('moduleB', mockUninstallBHook);
        onUninstall('any', mockUninstallAnyHook);
      });

      const modules = createModules([moduleB, moduleA, moduleC]);

      await modules.install();

      expect(modules.get('moduleA')?.isInstalled()).toBe(true);
      expect(modules.get('moduleB')?.isInstalled()).toBe(true);
      expect(modules.get('moduleC')?.isInstalled()).toBe(true);

      await modules.uninstall();

      expect(modules.get('moduleA')).toBeUndefined();
      expect(modules.get('moduleB')).toBeUndefined();
      expect(modules.get('moduleC')).toBeUndefined();

      expect(mockUninstallHook).toHaveBeenCalledOnce();
      expect(mockUninstallAHook).toHaveBeenCalledOnce();
      expect(mockUninstallBHook).toHaveBeenCalledOnce();
      expect(mockUninstallAnyHook).toHaveBeenCalledTimes(3);

      expect(any).toEqual([
        {
          name: 'moduleB',
          exports: { a: '1', b: 2 }
        },
        {
          name: 'moduleA',
          exports: { bar: 'baz' }
        },
        {
          name: 'moduleC',
          exports: {}
        }
      ]);
    });

    it.each([
      [1, 2, 3],
      [1, 3, 2],
      [2, 1, 3],
      [2, 3, 1],
      [3, 1, 2],
      [3, 2, 1]
    ])(
      'calls all uninstall hooks when modules are uninstalled sequentially in different orders',
      async (a1, a2, a3) => {
        const moduleA = createUninstallHookTestCase(
          'moduleA',
          'moduleB',
          'moduleC'
        );
        const moduleB = createUninstallHookTestCase(
          'moduleB',
          'moduleA',
          'moduleC'
        );
        const moduleC = createUninstallHookTestCase(
          'moduleC',
          'moduleA',
          'moduleB'
        );

        const inputArray = [
          moduleA.testModule,
          moduleB.testModule,
          moduleC.testModule
        ];
        const modules = createModules([
          inputArray[a1 - 1],
          inputArray[a2 - 1],
          inputArray[a3 - 1]
        ]);

        await modules.install();

        await modules.uninstall();

        verifyUninstallModuleHooks(moduleA);
        verifyUninstallModuleHooks(moduleB);
        verifyUninstallModuleHooks(moduleC);
      }
    );
  });
});

function verifyInstallModuleHooks(
  testModule: ReturnType<typeof createInstallHookTestCase>,
  dep1: ReturnType<typeof createInstallHookTestCase>,
  dep2: ReturnType<typeof createInstallHookTestCase>
) {
  const testName = testModule.testModule.name;
  const dep1Name = dep1.testModule.name;
  const dep2Name = dep2.testModule.name;

  expect(testModule.nullKeyHook).toHaveBeenCalledOnce();
  expect(testModule.nullKeyHook).toHaveBeenCalledWith(
    expect.objectContaining({
      resolved: expect.objectContaining({
        meta: expect.objectContaining({
          name: testName
        })
      })
    })
  );

  expect(testModule.specCurrKeyHook).toHaveBeenCalledOnce();
  expect(testModule.specCurrKeyHook).toHaveBeenCalledWith(
    expect.objectContaining({
      resolved: expect.objectContaining({
        meta: expect.objectContaining({
          name: testName
        })
      })
    })
  );

  expect(testModule.specDep1KeyHook).toHaveBeenCalledOnce();
  expect(testModule.specDep1KeyHook).toHaveBeenCalledWith(
    expect.objectContaining({
      resolved: expect.objectContaining({
        meta: expect.objectContaining({
          name: dep1Name
        })
      })
    })
  );

  expect(testModule.specDep2KeyHook).toHaveBeenCalledOnce();
  expect(testModule.specDep2KeyHook).toHaveBeenCalledWith(
    expect.objectContaining({
      resolved: expect.objectContaining({
        meta: expect.objectContaining({
          name: dep2Name
        })
      })
    })
  );

  expect(testModule.specArrDep1Dep2KeyHook).toHaveBeenCalledOnce();
  expect(
    testModule.specArrDep1Dep2KeyHook.mock.calls[0][0].map(
      (m: ModuleConfig) => m.resolved?.meta?.name
    )
  ).toEqual([dep1Name, dep2Name]);

  expect(testModule.specArrCurrDep1Dep2KeyHook).toHaveBeenCalledOnce();
  expect(
    testModule.specArrCurrDep1Dep2KeyHook.mock.calls[0][0].map(
      (m: ModuleConfig) => m.resolved?.meta?.name
    )
  ).toEqual([testName, dep1Name, dep2Name]);

  expect(testModule.specArrCurrDep1KeyHook).toHaveBeenCalledOnce();
  expect(
    testModule.specArrCurrDep1KeyHook.mock.calls[0][0].map(
      (m: ModuleConfig) => m.resolved?.meta?.name
    )
  ).toEqual([testName, dep1Name]);

  expect(testModule.specArrCurrDep2KeyHook).toHaveBeenCalledOnce();
  expect(
    testModule.specArrCurrDep2KeyHook.mock.calls[0][0].map(
      (m: ModuleConfig) => m.resolved?.meta?.name
    )
  ).toEqual([testName, dep2Name]);

  expect(testModule.anyKeyHook).toHaveBeenCalledTimes(3);
  expect(
    testModule.anyKeyHook.mock.calls.map(c => c[0].resolved.meta?.name)
  ).toEqual(expect.arrayContaining([testName, dep1Name, dep2Name]));

  expect(testModule.allKeyHook).toHaveBeenCalledOnce();
  expect(
    testModule.allKeyHook.mock.calls[0][0].map(
      (m: ModuleConfig) => m.resolved?.meta?.name
    )
  ).toEqual(expect.arrayContaining([testName, dep1Name, dep2Name]));
}

function verifyUninstallModuleHooks(
  testModule: ReturnType<typeof createUninstallHookTestCase>
) {
  expect(testModule.nullKeyHook).toHaveBeenCalledOnce();
  expect(testModule.specCurrKeyHook).toHaveBeenCalledOnce();
  expect(testModule.specDep1KeyHook).toHaveBeenCalledOnce();
  expect(testModule.specDep2KeyHook).toHaveBeenCalledOnce();
  expect(testModule.anyKeyHook).toHaveBeenCalled();
}
