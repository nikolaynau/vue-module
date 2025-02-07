import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  createModule,
  createModules,
  defineModule,
  ModuleHookKey
} from '../../src';
import type {
  ModuleInstance,
  ModuleOptions,
  ModuleSetupFunction,
  ModuleSetupReturn,
  ResolvedModule
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

describe('Install Hooks', () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should call onInstalled with array when modules are installed', async () => {
    const mockInstallHook = vi
      .fn()
      .mockImplementation(([moduleA, moduleB]: ResolvedModule[]) => {
        expect(moduleA.exports).toEqual({ bar: 'baz' });
        expect(moduleB.exports).toEqual({ a: '1', b: 2 });
      });

    const moduleA = createTestModule<{ foo?: string }, { bar: string }>(
      'moduleA',
      () => ({ bar: 'baz' })
    );
    const moduleB = createTestModule<
      { foo?: string },
      { a: string; b: number }
    >('moduleB', () => ({ a: '1', b: 2 }));

    const moduleC = createTestModule<
      { foo?: string },
      { a: string; b: number }
    >('moduleC', ({ onInstalled }) => {
      onInstalled(['moduleA', 'moduleB'], mockInstallHook);
    });

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
});

function verifyInstallModuleHooks(
  testModule: ReturnType<typeof createInstallHookTestCase>,
  dep1: ReturnType<typeof createInstallHookTestCase>,
  dep2: ReturnType<typeof createInstallHookTestCase>
) {
  const testName = testModule.testModule.getName();
  const dep1Name = dep1.testModule.getName();
  const dep2Name = dep2.testModule.getName();

  expect(testModule.nullKeyHook).toHaveBeenCalledOnce();
  expect(testModule.nullKeyHook).toHaveBeenCalledWith(
    expect.objectContaining({
      meta: expect.objectContaining({
        name: testName
      })
    })
  );

  expect(testModule.specCurrKeyHook).toHaveBeenCalledOnce();
  expect(testModule.specCurrKeyHook).toHaveBeenCalledWith(
    expect.objectContaining({
      meta: expect.objectContaining({
        name: testName
      })
    })
  );

  expect(testModule.specDep1KeyHook).toHaveBeenCalledOnce();
  expect(testModule.specDep1KeyHook).toHaveBeenCalledWith(
    expect.objectContaining({
      meta: expect.objectContaining({
        name: dep1Name
      })
    })
  );

  expect(testModule.specDep2KeyHook).toHaveBeenCalledOnce();
  expect(testModule.specDep2KeyHook).toHaveBeenCalledWith(
    expect.objectContaining({
      meta: expect.objectContaining({
        name: dep2Name
      })
    })
  );

  expect(testModule.specArrDep1Dep2KeyHook).toHaveBeenCalledOnce();
  expect(
    testModule.specArrDep1Dep2KeyHook.mock.calls[0][0].map(
      (m: ResolvedModule) => m.meta?.name
    )
  ).toEqual([dep1Name, dep2Name]);

  expect(testModule.specArrCurrDep1Dep2KeyHook).toHaveBeenCalledOnce();
  expect(
    testModule.specArrCurrDep1Dep2KeyHook.mock.calls[0][0].map(
      (m: ResolvedModule) => m.meta?.name
    )
  ).toEqual([testName, dep1Name, dep2Name]);

  expect(testModule.specArrCurrDep1KeyHook).toHaveBeenCalledOnce();
  expect(
    testModule.specArrCurrDep1KeyHook.mock.calls[0][0].map(
      (m: ResolvedModule) => m.meta?.name
    )
  ).toEqual([testName, dep1Name]);

  expect(testModule.specArrCurrDep2KeyHook).toHaveBeenCalledOnce();
  expect(
    testModule.specArrCurrDep2KeyHook.mock.calls[0][0].map(
      (m: ResolvedModule) => m.meta?.name
    )
  ).toEqual([testName, dep2Name]);

  expect(testModule.anyKeyHook).toHaveBeenCalledTimes(3);
  expect(testModule.anyKeyHook.mock.calls.map(c => c[0].meta?.name)).toEqual(
    expect.arrayContaining([testName, dep1Name, dep2Name])
  );

  expect(testModule.allKeyHook).toHaveBeenCalledOnce();
  expect(
    testModule.allKeyHook.mock.calls[0][0].map(
      (m: ResolvedModule) => m.meta?.name
    )
  ).toEqual(expect.arrayContaining([testName, dep1Name, dep2Name]));
}
