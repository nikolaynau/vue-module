import { describe, it, expect, vi } from 'vitest';
import {
  areAllModulesInstalled,
  getAllModules,
  invokeAllKeyHooks,
  invokeAnyKeyHooks,
  invokeHook,
  invokeNullKeyHooks,
  invokeSpecifiedKeyArrayHooks,
  invokeSpecifiedKeyHooks
} from '../src/hooks/hook';
import {
  ModuleHookKey,
  type ModuleHookConfig,
  type ModuleHookType,
  type ModuleInstance,
  type ModuleManager,
  type ModuleScope
} from '../src/types';

function createTestScope(
  moduleInstance?: ModuleInstance,
  modules?: ModuleInstance[],
  isInstalled: boolean = false
): ModuleScope {
  return {
    modules: {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      get: (value: any) => moduleInstance,
      isInstalled: () => isInstalled,
      toArray: () => modules ?? ([] as ModuleInstance[])
    } as ModuleManager
  };
}

const TEST_HOOK_TYPE: ModuleHookType = 'installed';

const ERROR_MESSAGE = 'Test error';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function errorCallback(moduleInstance: any) {
  throw new Error(ERROR_MESSAGE);
}

describe('invokeNullKeyHooks', () => {
  it('should call the callback for a hook with a null key', async () => {
    const callback = vi.fn(() => Promise.resolve());
    const hook: ModuleHookConfig = {
      type: TEST_HOOK_TYPE,
      key: null,
      callback,
      lock: false,
      called: false
    };
    const moduleInstance = { hooks: [hook] } as ModuleInstance;

    const promise = invokeNullKeyHooks(moduleInstance, TEST_HOOK_TYPE);

    expect(hook.lock).toBe(true);
    await promise;
    expect(hook.lock).toBe(false);
    expect(hook.called).toBe(true);

    expect(callback).toHaveBeenCalledWith(moduleInstance);
  });

  it('should not call the callback if there are no hooks with a null key', async () => {
    const callback = vi.fn(() => Promise.resolve());
    const hook: ModuleHookConfig = {
      type: TEST_HOOK_TYPE,
      key: 'non-null',
      callback,
      lock: false,
      called: false
    };
    const moduleInstance = { hooks: [hook] } as ModuleInstance;

    const promise = invokeNullKeyHooks(moduleInstance, TEST_HOOK_TYPE);

    expect(hook.lock).toBe(false);
    await promise;
    expect(hook.lock).toBe(false);
    expect(hook.called).toBe(false);

    expect(callback).not.toHaveBeenCalled();
  });
});

describe('invokeAllKeyHooks', () => {
  it('should call the callback for hooks with the "all" key', async () => {
    const callback = vi.fn(() => Promise.resolve());
    const hook: ModuleHookConfig = {
      type: TEST_HOOK_TYPE,
      key: ModuleHookKey.All,
      callback,
      lock: false,
      called: false
    };
    const moduleInstance = { hooks: [hook] } as ModuleInstance;

    const fakeModule = { name: 'mod1' } as ModuleInstance;
    const scope = createTestScope(fakeModule, [fakeModule], true);

    const promise = invokeAllKeyHooks(moduleInstance, scope, TEST_HOOK_TYPE);

    expect(hook.lock).toBe(true);
    await promise;
    expect(hook.lock).toBe(false);
    expect(hook.called).toBe(true);

    expect(callback).toHaveBeenCalledWith([fakeModule]);
  });
});

describe('invokeAnyKeyHooks', () => {
  it('should call the callback for hooks with the "any" key"', async () => {
    const callback = vi.fn(() => Promise.resolve());
    const hook: ModuleHookConfig = {
      type: TEST_HOOK_TYPE,
      key: ModuleHookKey.Any,
      callback,
      lock: false,
      called: false
    };
    const target = { hooks: [hook] } as ModuleInstance;
    const source = { name: 'source' } as ModuleInstance;

    const promise = invokeAnyKeyHooks(source, target, TEST_HOOK_TYPE);

    expect(hook.lock).toBe(false);
    await promise;
    expect(hook.lock).toBe(false);
    expect(hook.called).toBe(false);

    expect(callback).toHaveBeenCalledWith(source);
  });

  it('should not call the callback if there is no matching hook', async () => {
    const callback = vi.fn(() => Promise.resolve());
    const hook: ModuleHookConfig = {
      type: TEST_HOOK_TYPE,
      key: 'non-any',
      callback,
      lock: false,
      called: false
    };
    const target = { hooks: [hook] } as ModuleInstance;
    const source = { name: 'source' } as ModuleInstance;

    const promise = invokeAnyKeyHooks(source, target, TEST_HOOK_TYPE);

    expect(hook.lock).toBe(false);
    await promise;
    expect(hook.lock).toBe(false);
    expect(hook.called).toBe(false);

    expect(callback).not.toHaveBeenCalled();
  });
});

describe('invokeSpecifiedKeyHooks', () => {
  it('should call the callback if the source has a name and hook key matches source name', async () => {
    const callback = vi.fn(() => Promise.resolve());
    const hook: ModuleHookConfig = {
      type: TEST_HOOK_TYPE,
      key: 'moduleA',
      callback,
      lock: false,
      called: false
    };
    const target = { hooks: [hook] } as ModuleInstance;
    const moduleA = { name: 'moduleA', isInstalled: true } as ModuleInstance;
    const scope: ModuleScope = {
      modules: {
        get: (key: string) => (key === 'moduleA' ? moduleA : undefined),
        isInstalled: () => true,
        toArray: () => [moduleA]
      } as ModuleManager
    };

    const promise = invokeSpecifiedKeyHooks(target, scope, TEST_HOOK_TYPE);

    expect(hook.lock).toBe(true);
    await promise;
    expect(hook.lock).toBe(false);
    expect(hook.called).toBe(true);

    expect(callback).toHaveBeenCalledWith(moduleA);
  });

  it('should not call the callback if the source has no name', async () => {
    const callback = vi.fn(() => Promise.resolve());
    const hook: ModuleHookConfig = {
      type: TEST_HOOK_TYPE,
      key: 'anything',
      callback,
      lock: false,
      called: false
    };
    const target = { hooks: [hook] } as ModuleInstance;
    const moduleA = { name: 'moduleA', isInstalled: true } as ModuleInstance;
    const scope: ModuleScope = {
      modules: {
        get: (key: string) => (key === 'moduleA' ? moduleA : undefined),
        isInstalled: () => true,
        toArray: () => [moduleA]
      } as ModuleManager
    };

    const promise = invokeSpecifiedKeyHooks(target, scope, TEST_HOOK_TYPE);

    expect(hook.lock).toBe(false);
    await promise;
    expect(hook.lock).toBe(false);
    expect(hook.called).toBe(false);

    expect(callback).not.toHaveBeenCalled();
  });
});

describe('invokeSpecifiedKeyArrayHooks', () => {
  it('should call the callback for hooks with an array of keys if all modules are installed', async () => {
    const callback = vi.fn(() => Promise.resolve());
    const hook: ModuleHookConfig = {
      type: TEST_HOOK_TYPE,
      key: ['moduleA', 'moduleB'],
      callback,
      lock: false,
      called: false
    };
    const target = { hooks: [hook] } as ModuleInstance;

    const moduleA = { name: 'moduleA', isInstalled: true };
    const moduleB = { name: 'moduleB', isInstalled: true };
    const scope: ModuleScope = {
      modules: {
        get: (key: string) =>
          key === 'moduleA' ? moduleA : key === 'moduleB' ? moduleB : undefined,
        isInstalled: () => true,
        toArray: () => [moduleA, moduleB]
      } as ModuleManager
    };

    const promise = invokeSpecifiedKeyArrayHooks(target, scope, TEST_HOOK_TYPE);

    expect(hook.lock).toBe(true);
    await promise;
    expect(hook.lock).toBe(false);
    expect(hook.called).toBe(true);

    expect(callback).toHaveBeenCalledWith([moduleA, moduleB]);
  });

  it('should not call the callback for hooks with an array of keys if not all modules are installed', async () => {
    const callback = vi.fn(() => Promise.resolve());
    const hook: ModuleHookConfig = {
      type: TEST_HOOK_TYPE,
      key: ['moduleA', 'moduleB'],
      callback,
      lock: false,
      called: false
    };
    const target = { hooks: [hook] } as ModuleInstance;

    const moduleA = { name: 'moduleA', isInstalled: true };
    const moduleB = { name: 'moduleB', isInstalled: false };
    const scope: ModuleScope = {
      modules: {
        get: (key: string) =>
          key === 'moduleA' ? moduleA : key === 'moduleB' ? moduleB : undefined,
        isInstalled: () => false,
        toArray: () => [moduleA, moduleB]
      } as ModuleManager
    };

    const promise = invokeSpecifiedKeyArrayHooks(target, scope, TEST_HOOK_TYPE);

    expect(hook.lock).toBe(false);
    await promise;
    expect(hook.lock).toBe(false);
    expect(hook.called).toBe(false);

    expect(callback).not.toHaveBeenCalled();
  });
});

describe('invokeHook', () => {
  it('should successfully call the callback and update the lock and called flags', async () => {
    const callback = vi.fn(() => Promise.resolve());
    const hook: ModuleHookConfig = {
      type: TEST_HOOK_TYPE,
      key: 'someKey',
      callback,
      lock: false,
      called: false
    };
    const moduleInstance = { name: 'module' } as ModuleInstance;

    const promise = invokeHook(hook, moduleInstance);

    expect(hook.lock).toBe(true);
    await promise;
    expect(hook.lock).toBe(false);
    expect(hook.called).toBe(true);

    expect(callback).toHaveBeenCalledWith(moduleInstance);
  });

  it('should not set the called flag for a hook with the key "any"', async () => {
    const callback = vi.fn(() => Promise.resolve());
    const hook: ModuleHookConfig = {
      type: TEST_HOOK_TYPE,
      key: 'any',
      callback,
      lock: false,
      called: false
    };
    const moduleInstance = { name: 'module' } as ModuleInstance;

    const promise = invokeHook(hook, moduleInstance);

    expect(hook.lock).toBe(false);
    await promise;
    expect(hook.lock).toBe(false);
    expect(hook.called).toBe(false);

    expect(callback).toHaveBeenCalledWith(moduleInstance);
  });

  it('should add the error to errors when suppressErrors is true', async () => {
    const errorObj = new Error('callback failed');
    const callback = vi.fn(() => Promise.reject(errorObj));
    const hook: ModuleHookConfig = {
      type: TEST_HOOK_TYPE,
      key: 'someKey',
      callback,
      lock: false,
      called: false
    };
    const moduleInstance = { name: 'module' } as ModuleInstance;
    const errors: Error[] = [];

    const promise = invokeHook(hook, moduleInstance, true, errors);

    expect(hook.lock).toBe(true);
    await promise;
    expect(hook.lock).toBe(false);
    expect(hook.called).toBe(false);

    expect(errors).toContain(errorObj);
  });

  it('should throw the error when suppressErrors is false', async () => {
    const errorObj = new Error('callback failed');
    const callback = vi.fn(() => Promise.reject(errorObj));
    const hook: ModuleHookConfig = {
      type: TEST_HOOK_TYPE,
      key: 'someKey',
      callback,
      lock: false,
      called: false
    };
    const moduleInstance = { name: 'module' } as ModuleInstance;

    await expect(invokeHook(hook, moduleInstance, false)).rejects.toThrow(
      errorObj
    );
    expect(hook.lock).toBe(false);
    expect(hook.called).toBe(false);
  });
});

describe('areAllModulesInstalled', () => {
  it('returns true if all modules are installed', () => {
    const scope = createTestScope(undefined, undefined, true);
    expect(areAllModulesInstalled(scope)).toBe(true);
  });

  it('returns false if the modules are not installed', () => {
    const scope = createTestScope();
    expect(areAllModulesInstalled(scope)).toBe(false);
  });
});

describe('getAllModules', () => {
  it('returns an array of modules obtained from modules.toArray()', () => {
    const modulesArray = [
      { name: 'mod1' },
      { name: 'mod2' }
    ] as ModuleInstance[];
    const scope = createTestScope(undefined, modulesArray, true);
    expect(getAllModules(scope)).toEqual(modulesArray);
  });
});

describe('Module Hook Invocation with suppressErrors = true', () => {
  it('invokeNullKeyHooks should push error into errors array', async () => {
    const moduleInstance = {
      hooks: [
        {
          type: TEST_HOOK_TYPE,
          key: null,
          callback: errorCallback,
          lock: false,
          called: false
        }
      ]
    } as ModuleInstance;

    const errors: Error[] = [];

    await invokeNullKeyHooks(moduleInstance, TEST_HOOK_TYPE, true, errors);

    expect(errors).toHaveLength(1);
    expect(errors[0].message).toBe(ERROR_MESSAGE);

    expect(moduleInstance.hooks?.[0].lock).toBe(false);
    expect(moduleInstance.hooks?.[0].called).toBe(false);
  });

  it('invokeAllKeyHooks should push error into errors array', async () => {
    const moduleInstance = {
      hooks: [
        {
          type: TEST_HOOK_TYPE,
          key: ModuleHookKey.All,
          callback: errorCallback,
          lock: false,
          called: false
        }
      ]
    } as ModuleInstance;

    const scope = createTestScope(undefined, undefined, true);

    const errors: Error[] = [];

    await invokeAllKeyHooks(
      moduleInstance,
      scope,
      TEST_HOOK_TYPE,
      true,
      errors
    );

    expect(errors).toHaveLength(1);
    expect(errors[0].message).toBe(ERROR_MESSAGE);

    expect(moduleInstance.hooks?.[0].lock).toBe(false);
    expect(moduleInstance.hooks?.[0].called).toBe(false);
  });

  it('invokeAnyKeyHooks should push error into errors array', async () => {
    const target = {
      hooks: [
        {
          type: TEST_HOOK_TYPE,
          key: ModuleHookKey.Any,
          callback: errorCallback,
          lock: false,
          called: false
        }
      ]
    } as ModuleInstance;

    const source = {
      name: 'sourceModule'
    } as ModuleInstance;

    const errors: Error[] = [];

    await invokeAnyKeyHooks(source, target, TEST_HOOK_TYPE, true, errors);

    expect(errors).toHaveLength(1);
    expect(errors[0].message).toBe(ERROR_MESSAGE);

    expect(target.hooks?.[0].lock).toBe(false);
    expect(target.hooks?.[0].called).toBe(false);
  });

  it('invokeSpecifiedKeyHooks should push error into errors array', async () => {
    const target = {
      hooks: [
        {
          type: TEST_HOOK_TYPE,
          key: 'moduleA',
          callback: errorCallback,
          lock: false,
          called: false
        }
      ]
    } as ModuleInstance;

    const moduleA = { name: 'moduleA', isInstalled: true } as ModuleInstance;

    const scope: ModuleScope = {
      modules: {
        get: (key: string) => (key === 'moduleA' ? moduleA : undefined),
        isInstalled: () => true,
        toArray: () => [moduleA]
      } as ModuleManager
    };

    const errors: Error[] = [];

    await invokeSpecifiedKeyHooks(
      target,
      scope,
      TEST_HOOK_TYPE,
      undefined,
      true,
      errors
    );

    expect(errors).toHaveLength(1);
    expect(errors[0].message).toBe(ERROR_MESSAGE);

    expect(target.hooks?.[0].lock).toBe(false);
    expect(target.hooks?.[0].called).toBe(false);
  });

  it('invokeSpecifiedKeyArrayHooks should push error into errors array', async () => {
    const target = {
      hooks: [
        {
          type: TEST_HOOK_TYPE,
          key: ['moduleA'],
          callback: errorCallback,
          lock: false,
          called: false
        }
      ]
    } as ModuleInstance;

    const moduleA = { name: 'moduleA', isInstalled: true };
    const scope: ModuleScope = {
      modules: {
        get: (key: string) => (key === 'moduleA' ? moduleA : undefined),
        isInstalled: () => true,
        toArray: () => [moduleA]
      } as ModuleManager
    };

    const errors: Error[] = [];

    await invokeSpecifiedKeyArrayHooks(
      target,
      scope,
      TEST_HOOK_TYPE,
      undefined,
      true,
      errors
    );

    expect(errors).toHaveLength(1);
    expect(errors[0].message).toBe(ERROR_MESSAGE);

    expect(target.hooks?.[0].lock).toBe(false);
    expect(target.hooks?.[0].called).toBe(false);
  });
});
