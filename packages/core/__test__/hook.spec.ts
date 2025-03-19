import { describe, it, expect, vi } from 'vitest';
import {
  areAllModulesInstalled,
  getAllModules,
  invokeAllKeyHooks,
  invokeAnyHook,
  invokeAnyKeyHooks,
  invokeHook,
  invokeNullKeyHooks,
  invokeSpecKeyArrayHooks,
  invokeSpecKeyHooks
} from '../src/hooks/hook';
import {
  ModuleHookKey,
  type ModuleConfig,
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
    const moduleConfig = { resolved: { hooks: [hook] } } as ModuleConfig;

    const promise = invokeNullKeyHooks(moduleConfig, TEST_HOOK_TYPE);

    expect(hook.lock).toBe(true);
    await promise;
    expect(hook.lock).toBe(false);
    expect(hook.called).toBe(true);

    expect(callback).toHaveBeenCalledWith(moduleConfig);
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
    const moduleConfig = { resolved: { hooks: [hook] } } as ModuleConfig;

    const promise = invokeNullKeyHooks(moduleConfig, TEST_HOOK_TYPE);

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
    const moduleConfig = { resolved: { hooks: [hook] } } as ModuleConfig;
    const fakeModule = {
      isInstalled: () => true,
      config: { resolved: {} }
    } as ModuleInstance;
    const scope = createTestScope(fakeModule, [fakeModule], true);

    const promise = invokeAllKeyHooks(moduleConfig, scope, TEST_HOOK_TYPE);

    expect(hook.lock).toBe(true);
    await promise;
    expect(hook.lock).toBe(false);
    expect(hook.called).toBe(true);

    expect(callback).toHaveBeenCalledWith([fakeModule.config]);
  });
});

describe('invokeAnyKeyHooks', () => {
  it('should call the callback for hooks with the "any" key"', async () => {
    const callback = vi.fn(() => Promise.resolve());
    const hook: ModuleHookConfig = {
      type: TEST_HOOK_TYPE,
      key: ModuleHookKey.Any,
      callback
    };
    const target = { resolved: { hooks: [hook] } } as ModuleConfig;
    const source = { resolved: {}, id: 1 } as ModuleConfig;

    const promise = invokeAnyKeyHooks(source, target, TEST_HOOK_TYPE);

    expect(hook.lockFor?.get(source.id!)).toBe(true);
    await promise;
    expect(hook.lockFor?.get(source.id!)).toBe(false);
    expect(hook.calledFor?.get(source.id!)).toBe(true);

    expect(callback).toHaveBeenCalledWith(source);
  });

  it('should not call the callback if there is no matching hook', async () => {
    const callback = vi.fn(() => Promise.resolve());
    const hook: ModuleHookConfig = {
      type: TEST_HOOK_TYPE,
      key: 'non-any',
      callback
    };
    const target = { resolved: { hooks: [hook] } } as ModuleConfig;
    const source = { resolved: {}, id: 1 } as ModuleConfig;

    const promise = invokeAnyKeyHooks(source, target, TEST_HOOK_TYPE);

    expect(!!hook.lockFor?.get(source.id!)).toBe(false);
    await promise;
    expect(!!hook.lockFor?.get(source.id!)).toBe(false);
    expect(!!hook.calledFor?.get(source.id!)).toBe(false);

    expect(callback).not.toHaveBeenCalled();
  });

  it('should not call the callback if config no provided id', async () => {
    const callback = vi.fn(() => Promise.resolve());
    const hook: ModuleHookConfig = {
      type: TEST_HOOK_TYPE,
      key: ModuleHookKey.Any,
      callback
    };
    const target = { resolved: { hooks: [hook] } } as ModuleConfig;
    const source = { resolved: {} } as ModuleConfig;

    const promise = invokeAnyKeyHooks(source, target, TEST_HOOK_TYPE);

    expect(!!hook.lockFor?.get(source.id!)).toBe(false);
    await promise;
    expect(!!hook.lockFor?.get(source.id!)).toBe(false);
    expect(!!hook.calledFor?.get(source.id!)).toBe(false);

    expect(callback).not.toHaveBeenCalled();
  });
});

describe('invokeSpecKeyHooks', () => {
  it('should call the callback if the source has a name and hook key matches source name', async () => {
    const callback = vi.fn(() => Promise.resolve());
    const hook: ModuleHookConfig = {
      type: TEST_HOOK_TYPE,
      key: 'moduleA',
      callback,
      lock: false,
      called: false
    };
    const target = { resolved: { hooks: [hook] } } as ModuleConfig;
    const moduleA = {
      config: { resolved: { meta: { name: 'moduleA' } } },
      isInstalled: () => true
    } as ModuleInstance;

    const scope: ModuleScope = {
      modules: {
        get: (key: string) => (key === 'moduleA' ? moduleA : undefined),
        isInstalled: () => true,
        toArray: () => [moduleA]
      } as ModuleManager
    };

    const promise = invokeSpecKeyHooks(target, scope, TEST_HOOK_TYPE);

    expect(hook.lock).toBe(true);
    await promise;
    expect(hook.lock).toBe(false);
    expect(hook.called).toBe(true);

    expect(callback).toHaveBeenCalledWith(moduleA.config);
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
    const target = { resolved: { hooks: [hook] } } as ModuleConfig;
    const moduleA = {
      config: { resolved: { meta: { name: 'moduleA' } } },
      isInstalled: () => true
    } as ModuleInstance;

    const scope: ModuleScope = {
      modules: {
        get: (key: string) => (key === 'moduleA' ? moduleA : undefined),
        isInstalled: () => true,
        toArray: () => [moduleA]
      } as ModuleManager
    };

    const promise = invokeSpecKeyHooks(target, scope, TEST_HOOK_TYPE);

    expect(hook.lock).toBe(false);
    await promise;
    expect(hook.lock).toBe(false);
    expect(hook.called).toBe(false);

    expect(callback).not.toHaveBeenCalled();
  });
});

describe('invokeSpecKeyArrayHooks', () => {
  it('should call the callback for hooks with an array of keys if all modules are installed', async () => {
    const callback = vi.fn(() => Promise.resolve());
    const hook: ModuleHookConfig = {
      type: TEST_HOOK_TYPE,
      key: ['moduleA', 'moduleB'],
      callback,
      lock: false,
      called: false
    };
    const target = { resolved: { hooks: [hook] } } as ModuleConfig;

    const moduleA = {
      config: { resolved: { meta: { name: 'moduleA' } } },
      isInstalled: () => true
    } as ModuleInstance;
    const moduleB = {
      config: { resolved: { meta: { name: 'moduleB' } } },
      isInstalled: () => true
    } as ModuleInstance;

    const map = new Map();
    map.set('moduleA', moduleA);
    map.set('moduleB', moduleB);

    const scope: ModuleScope = {
      modules: {
        isInstalled: () => true,
        toArray: () => [moduleA, moduleB],
        toMap: () => map
      } as ModuleManager
    };

    const promise = invokeSpecKeyArrayHooks(target, scope, TEST_HOOK_TYPE);

    expect(hook.lock).toBe(true);
    await promise;
    expect(hook.lock).toBe(false);
    expect(hook.called).toBe(true);

    expect(callback).toHaveBeenCalledWith([moduleA.config, moduleB.config]);
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
    const target = { resolved: { hooks: [hook] } } as ModuleConfig;

    const moduleA = {
      config: { resolved: { meta: { name: 'moduleA' } } },
      isInstalled: () => true
    } as ModuleInstance;
    const moduleB = {
      config: { resolved: { meta: { name: 'moduleB' } } },
      isInstalled: () => false
    } as ModuleInstance;

    const map = new Map();
    map.set('moduleA', moduleA);
    map.set('moduleB', moduleB);

    const scope: ModuleScope = {
      modules: {
        isInstalled: () => true,
        toArray: () => [moduleA, moduleB],
        toMap: () => map
      } as ModuleManager
    };

    const promise = invokeSpecKeyArrayHooks(target, scope, TEST_HOOK_TYPE);

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
    const target = { resolved: {} } as ModuleConfig;

    const promise = invokeHook(hook, target);

    expect(hook.lock).toBe(true);
    await promise;
    expect(hook.lock).toBe(false);
    expect(hook.called).toBe(true);

    expect(callback).toHaveBeenCalledWith(target);
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
    const target = { resolved: {} } as ModuleConfig;
    const errors: Error[] = [];

    const promise = invokeHook(hook, target, true, errors);

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
    const target = { resolved: {} } as ModuleConfig;

    await expect(invokeHook(hook, target, false)).rejects.toThrow(errorObj);
    expect(hook.lock).toBe(false);
    expect(hook.called).toBe(false);
  });
});

describe('invokeAnyHook', () => {
  it('should successfully call the callback and update the lockFor and calledFor map', async () => {
    const callback = vi.fn(() => Promise.resolve());
    const hook: ModuleHookConfig = {
      type: TEST_HOOK_TYPE,
      key: 'someKey',
      callback
    };
    const target = { resolved: {}, id: 1 } as ModuleConfig;

    const promise = invokeAnyHook(hook, target);

    expect(hook.lockFor?.get(target.id!)).toBe(true);
    await promise;
    expect(hook.lockFor?.get(target.id!)).toBe(false);
    expect(hook.calledFor?.get(target.id!)).toBe(true);

    expect(callback).toHaveBeenCalledWith(target);
  });

  it('should add the error to errors when suppressErrors is true', async () => {
    const errorObj = new Error('callback failed');
    const callback = vi.fn(() => Promise.reject(errorObj));
    const hook: ModuleHookConfig = {
      type: TEST_HOOK_TYPE,
      key: 'someKey',
      callback
    };
    const target = { resolved: {}, id: 1 } as ModuleConfig;
    const errors: Error[] = [];

    const promise = invokeAnyHook(hook, target, true, errors);

    expect(hook.lockFor?.get(target.id!)).toBe(true);
    await promise;
    expect(hook.lockFor?.get(target.id!)).toBe(false);
    expect(hook.calledFor?.has(target.id!)).toBe(false);

    expect(errors).toContain(errorObj);
  });

  it('should throw the error when suppressErrors is false', async () => {
    const errorObj = new Error('callback failed');
    const callback = vi.fn(() => Promise.reject(errorObj));
    const hook: ModuleHookConfig = {
      type: TEST_HOOK_TYPE,
      key: 'someKey',
      callback
    };
    const target = { resolved: {}, id: 1 } as ModuleConfig;

    await expect(invokeAnyHook(hook, target, false)).rejects.toThrow(errorObj);
    expect(hook.lockFor?.get(target.id!)).toBe(false);
    expect(hook.calledFor?.has(target.id!)).toBe(false);
  });

  it('should not call callback when target id is missing', async () => {
    const errorObj = new Error('callback failed');
    const callback = vi.fn(() => Promise.reject(errorObj));
    const hook: ModuleHookConfig = {
      type: TEST_HOOK_TYPE,
      key: 'someKey',
      callback
    };
    const target = { resolved: {} } as ModuleConfig;

    const promise = invokeAnyHook(hook, target);

    expect(!!hook.lockFor?.get(target.id!)).toBe(false);
    await promise;
    expect(!!hook.lockFor?.get(target.id!)).toBe(false);
    expect(!!hook.calledFor?.get(target.id!)).toBe(false);

    expect(callback).not.toHaveBeenCalled();
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
      { config: { resolved: {} } },
      { config: {} }
    ] as ModuleInstance[];
    const scope = createTestScope(undefined, modulesArray, true);
    expect(getAllModules(scope)).toEqual(modulesArray.map(m => m.config));
  });
});

describe('Module Hook Invocation with suppressErrors = true', () => {
  it('invokeNullKeyHooks should push error into errors array', async () => {
    const target = {
      resolved: {
        hooks: [
          {
            type: TEST_HOOK_TYPE,
            key: null,
            callback: errorCallback,
            lock: false,
            called: false
          }
        ]
      }
    } as ModuleConfig;

    const errors: Error[] = [];

    await invokeNullKeyHooks(target, TEST_HOOK_TYPE, true, errors);

    expect(errors).toHaveLength(1);
    expect(errors[0].message).toBe(ERROR_MESSAGE);

    expect(target.resolved?.hooks?.[0].lock).toBe(false);
    expect(target.resolved?.hooks?.[0].called).toBe(false);
  });

  it('invokeAllKeyHooks should push error into errors array', async () => {
    const target = {
      resolved: {
        hooks: [
          {
            type: TEST_HOOK_TYPE,
            key: ModuleHookKey.All,
            callback: errorCallback,
            lock: false,
            called: false
          }
        ]
      }
    } as ModuleConfig;

    const scope = createTestScope(undefined, undefined, true);

    const errors: Error[] = [];

    await invokeAllKeyHooks(target, scope, TEST_HOOK_TYPE, true, errors);

    expect(errors).toHaveLength(1);
    expect(errors[0].message).toBe(ERROR_MESSAGE);

    expect(target.resolved?.hooks?.[0].lock).toBe(false);
    expect(target.resolved?.hooks?.[0].called).toBe(false);
  });

  it('invokeAnyKeyHooks should push error into errors array', async () => {
    const target = {
      resolved: {
        hooks: [
          {
            type: TEST_HOOK_TYPE,
            key: ModuleHookKey.Any,
            callback: errorCallback,
            lock: false,
            called: false
          }
        ]
      }
    } as ModuleConfig;

    const source = {
      resolved: {},
      id: 1
    } as ModuleConfig;

    const errors: Error[] = [];

    await invokeAnyKeyHooks(source, target, TEST_HOOK_TYPE, true, errors);

    expect(errors).toHaveLength(1);
    expect(errors[0].message).toBe(ERROR_MESSAGE);

    expect(target.resolved?.hooks?.[0].lock).toBe(false);
    expect(target.resolved?.hooks?.[0].called).toBe(false);
  });

  it('invokeSpecKeyHooks should push error into errors array', async () => {
    const target = {
      resolved: {
        hooks: [
          {
            type: TEST_HOOK_TYPE,
            key: 'moduleA',
            callback: errorCallback,
            lock: false,
            called: false
          }
        ]
      }
    } as ModuleConfig;

    const moduleA = {
      config: { resolved: { meta: { name: 'moduleA' } } },
      isInstalled: () => true
    } as ModuleInstance;

    const scope: ModuleScope = {
      modules: {
        get: (key: string) => (key === 'moduleA' ? moduleA : undefined),
        isInstalled: () => true,
        toArray: () => [moduleA]
      } as ModuleManager
    };

    const errors: Error[] = [];

    await invokeSpecKeyHooks(
      target,
      scope,
      TEST_HOOK_TYPE,
      undefined,
      true,
      errors
    );

    expect(errors).toHaveLength(1);
    expect(errors[0].message).toBe(ERROR_MESSAGE);

    expect(target.resolved?.hooks?.[0].lock).toBe(false);
    expect(target.resolved?.hooks?.[0].called).toBe(false);
  });

  it('invokeSpecKeyArrayHooks should push error into errors array', async () => {
    const target = {
      resolved: {
        hooks: [
          {
            type: TEST_HOOK_TYPE,
            key: ['moduleA'],
            callback: errorCallback,
            lock: false,
            called: false
          }
        ]
      }
    } as ModuleConfig;

    const moduleA = {
      config: { resolved: { meta: { name: 'moduleA' } } },
      isInstalled: () => true
    } as ModuleInstance;

    const map = new Map();
    map.set('moduleA', moduleA);

    const scope: ModuleScope = {
      modules: {
        toMap: () => map,
        isInstalled: () => true,
        toArray: () => [moduleA]
      } as ModuleManager
    };

    const errors: Error[] = [];

    await invokeSpecKeyArrayHooks(
      target,
      scope,
      TEST_HOOK_TYPE,
      undefined,
      true,
      errors
    );

    expect(errors).toHaveLength(1);
    expect(errors[0].message).toBe(ERROR_MESSAGE);

    expect(target.resolved?.hooks?.[0].lock).toBe(false);
    expect(target.resolved?.hooks?.[0].called).toBe(false);
  });
});
