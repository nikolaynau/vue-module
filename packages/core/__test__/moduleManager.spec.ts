import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  vi,
  type MockInstance,
  type Mock
} from 'vitest';
import { ModuleManagerClass } from '../src/modules/moduleManager';
import * as promiseUtils from '../src/promise';

import type {
  ModuleConfig,
  ModuleInstance,
  ModuleManager,
  ModuleScope,
  ResolvedModule
} from '../src/types';

function createTestModule(name: string, installed = false): ModuleInstance {
  const instance: ModuleInstance = {
    name,
    config: {
      loader: () => ({}),
      resolved: { meta: { name } } as ResolvedModule,
      scope: undefined,
      enforce: undefined
    },
    get isInstalled() {
      return installed;
    },
    install: vi.fn(async () => {
      installed = true;
    }),
    uninstall: vi.fn(async () => {
      installed = false;
    }),
    meta: undefined,
    version: undefined,
    exports: undefined,
    options: undefined,
    hooks: undefined,
    scope: undefined,
    ignoreHookErrors: false,
    hookErrors: []
  };
  return instance;
}

describe('ModuleManagerClass', () => {
  let module1: ModuleInstance;
  let module2: ModuleInstance;
  let module3: ModuleInstance;
  let manager: ModuleManagerClass;
  let scope: ModuleScope;
  let mockHandlePromises: MockInstance;

  beforeEach(() => {
    module1 = createTestModule('module1');
    module2 = createTestModule('module2');
    module3 = createTestModule('module3');
    scope = { modules: {} as ModuleManager };
    manager = new ModuleManagerClass([module1, module2]);

    mockHandlePromises = vi.spyOn(promiseUtils, 'handlePromises');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should initialize with modules', () => {
    expect(manager.size).toBe(2);
    expect(manager.isEmpty).toBe(false);
    expect(manager.toArray()).toEqual([module1, module2]);

    const map = manager.toMap();
    expect(map.get('module1')).toBe(module1);
    expect(map.get('module2')).toBe(module2);
  });

  it('should set and get scope', () => {
    manager.setScope(scope);

    expect(manager.getScope()).toBe(scope);
    expect(module1.config.scope).toBe(scope);
    expect(module2.config.scope).toBe(scope);
  });

  it('should get module by string, instance, and config', () => {
    expect(manager.get('module1')).toBe(module1);
    expect(manager.get(module2)).toBe(module2);
    expect(
      manager.get({
        resolved: { meta: { name: 'module1' } } as ResolvedModule
      } as ModuleConfig)
    ).toBe(module1);
    expect(manager.get(module1.config)).toBe(module1);

    expect(manager.get('nonexistent')).toBeUndefined();
    expect(manager.get(module3)).toBeUndefined();
    const nonExistentConfig: ModuleConfig = {
      loader: () => ({}),
      resolved: { meta: { name: 'nonexistent' } } as ResolvedModule
    };
    expect(manager.get(nonExistentConfig)).toBeUndefined();
  });

  it('should return undefined / false for invalid input types', () => {
    expect(manager.get(123)).toBeUndefined();
    expect(manager.has(123)).toBe(false);
  });

  it('should check has method for string, instance, and config', () => {
    expect(manager.has('module1')).toBe(true);
    expect(manager.has(module2)).toBe(true);
    expect(manager.has(module2.config)).toBe(true);
    expect(manager.has({ resolved: { meta: { name: 'module1' } } })).toBe(true);

    expect(manager.has('nonexistent')).toBe(false);
    expect(manager.has(module3)).toBe(false);
  });

  it('should add module if not exists', () => {
    manager.setScope(scope);

    expect(manager.size).toBe(2);
    manager.add(module3);
    expect(manager.size).toBe(3);
    expect(manager.get('module3')).toBe(module3);
    expect(manager.get(module3)).toBe(module3);
    expect(manager.get(module3.config)).toBe(module3);
    expect(module3.config.scope).toBe(scope);

    manager.add(module3);
    expect(manager.size).toBe(3);
  });

  it('should remove module by string, instance, and config', () => {
    let removed = manager.remove('module1');
    expect(removed).toBe(module1);
    expect(manager.size).toBe(1);
    expect(manager.has('module1')).toBe(false);

    manager.add(module1);
    expect(manager.has(module1)).toBe(true);

    removed = manager.remove(module1);
    expect(removed).toBe(module1);
    expect(manager.has(module1)).toBe(false);

    manager.add(module1);

    const config = { resolved: { meta: { name: 'module1' } } } as ModuleConfig;
    removed = manager.remove(config);
    expect(removed).toBe(module1);
    expect(manager.has(module1)).toBe(false);
  });

  it('should remove all modules', () => {
    manager.removeAll();
    expect(manager.size).toBe(0);
    expect(manager.toMap().size).toBe(0);
    expect(manager.isEmpty).toBe(true);
  });

  it('isInstalled should return correct values', async () => {
    expect(manager.isInstalled('module1')).toBe(false);
    expect(manager.isInstalled()).toBe(false);

    module1.install();
    expect(module1.isInstalled).toBe(true);
    expect(manager.isInstalled('module1')).toBe(true);
    expect(manager.isInstalled()).toBe(false);

    module2.install();
    expect(module2.isInstalled).toBe(true);
    expect(manager.isInstalled()).toBe(true);
  });

  it('should bulk install modules', async () => {
    expect(module1.isInstalled).toBe(false);
    expect(module2.isInstalled).toBe(false);

    await manager.install();
    expect(module1.install).toHaveBeenCalled();
    expect(module2.install).toHaveBeenCalled();
    expect(module1.isInstalled).toBe(true);
    expect(module2.isInstalled).toBe(true);
  });

  it('should bulk install modules using a filter', async () => {
    expect(module1.isInstalled).toBe(false);
    expect(module2.isInstalled).toBe(false);

    await manager.install((m: any) => m.name === 'module1');
    expect(module1.isInstalled).toBe(true);
    expect(module1.install).toHaveBeenCalled();
    expect(module2.install).not.toHaveBeenCalled();
  });

  it('should bulk uninstall modules', async () => {
    module1.install();
    module2.install();
    expect(module1.isInstalled).toBe(true);
    expect(module2.isInstalled).toBe(true);

    await manager.uninstall();
    expect(module1.uninstall).toHaveBeenCalled();
    expect(module2.uninstall).toHaveBeenCalled();
    expect(module1.isInstalled).toBe(false);
    expect(module2.isInstalled).toBe(false);
  });

  it('should bulk uninstall modules using a filter', async () => {
    module1.install();
    module2.install();
    expect(module1.isInstalled).toBe(true);
    expect(module2.isInstalled).toBe(true);

    await manager.uninstall((m: any) => m.name === 'module1');
    expect(module1.isInstalled).toBe(false);
    expect(module1.uninstall).toHaveBeenCalled();
    expect(module2.uninstall).not.toHaveBeenCalled();
  });

  it('should install and uninstall an individual module', async () => {
    expect(module3.isInstalled).toBe(false);

    await manager.install(module3);
    expect(module3.install).toHaveBeenCalled();
    expect(module3.isInstalled).toBe(true);

    await manager.uninstall('module3');
    expect(module3.uninstall).toHaveBeenCalled();
    expect(module3.isInstalled).toBe(false);
  });

  it('should get module at specific index', () => {
    expect(manager.getAt(0)).toBe(module1);
    expect(manager.getAt(1)).toBe(module2);
    expect(manager.getAt(2)).toBeUndefined();
  });

  it('should bulk install resolve successfully and collect errors when suppressErrors is enabled', async () => {
    const error = new Error('install error');
    const errors: Error[] = [];

    (module2.install as unknown as MockInstance).mockRejectedValue(error);

    mockHandlePromises.mockImplementation(async (...args: any[]) => {
      for (const promiseFn of args[0]) {
        try {
          await promiseFn();
        } catch (e) {
          args[1].errors.push(e as Error);
        }
      }
    });

    await expect(
      manager.install(undefined, { suppressErrors: true, errors })
    ).resolves.toBeUndefined();

    expect(module1.install).toHaveBeenCalled();
    expect(module2.install).toHaveBeenCalled();

    expect(module1.isInstalled).toBe(true);
    expect(module2.isInstalled).toBe(false);

    expect(errors.length).toBe(1);
    expect(errors[0]).toBeInstanceOf(Error);
    expect(errors[0].message).toBe(error.message);
  });

  it('should bulk uninstall resolve successfully and collect errors when suppressErrors is enabled', async () => {
    const error = new Error('install error');
    const errors: Error[] = [];

    (module2.uninstall as unknown as MockInstance).mockRejectedValue(error);

    mockHandlePromises.mockImplementation(async (...args: any[]) => {
      for (const promiseFn of args[0]) {
        try {
          await promiseFn();
        } catch (e) {
          args[1].errors.push(e as Error);
        }
      }
    });

    module1.install();
    module2.install();
    expect(module1.isInstalled).toBe(true);
    expect(module2.isInstalled).toBe(true);

    await expect(
      manager.uninstall(undefined, { suppressErrors: true, errors })
    ).resolves.toBeUndefined();

    expect(module1.uninstall).toHaveBeenCalled();
    expect(module2.uninstall).toHaveBeenCalled();

    expect(module1.isInstalled).toBe(false);
    expect(module2.isInstalled).toBe(true);

    expect(errors.length).toBe(1);
    expect(errors[0]).toBeInstanceOf(Error);
    expect(errors[0].message).toBe(error.message);
  });

  it('should process modules in sorted order for install based on enforce (pre → default → post → fin)', async () => {
    const order: string[] = [];

    const modulePre = createTestModule('modulePre');
    modulePre.config.enforce = 'pre';
    (modulePre.install as Mock).mockImplementation(() => {
      order.push('modulePre');
    });

    const modulePost = createTestModule('modulePost');
    modulePost.config.enforce = 'post';
    (modulePost.install as Mock).mockImplementation(() => {
      order.push('modulePost');
    });

    const moduleFin = createTestModule('moduleFin');
    moduleFin.config.enforce = 'fin';
    (moduleFin.install as Mock).mockImplementation(() => {
      order.push('moduleFin');
    });

    const defaultModule = createTestModule('defaultModule');
    defaultModule.config.enforce = undefined;
    (defaultModule.install as Mock).mockImplementation(() => {
      order.push('defaultModule');
    });

    const manager = new ModuleManagerClass([
      modulePost,
      moduleFin,
      modulePre,
      defaultModule
    ]);

    await manager.install();

    expect(order).toEqual([
      'modulePre',
      'defaultModule',
      'modulePost',
      'moduleFin'
    ]);
  });

  it('should process modules in sorted order for uninstall based on enforce (pre → default → post → fin)', async () => {
    const order: string[] = [];

    const modulePre = createTestModule('modulePre', true);
    modulePre.config.enforce = 'pre';
    (modulePre.uninstall as Mock).mockImplementation(() => {
      order.push('modulePre');
    });

    const modulePost = createTestModule('modulePost', true);
    modulePost.config.enforce = 'post';
    (modulePost.uninstall as Mock).mockImplementation(() => {
      order.push('modulePost');
    });

    const moduleFin = createTestModule('moduleFin', true);
    moduleFin.config.enforce = 'fin';
    (moduleFin.uninstall as Mock).mockImplementation(() => {
      order.push('moduleFin');
    });

    const defaultModule = createTestModule('defaultModule', true);
    defaultModule.config.enforce = undefined;
    (defaultModule.uninstall as Mock).mockImplementation(() => {
      order.push('defaultModule');
    });

    const manager = new ModuleManagerClass([
      modulePost,
      moduleFin,
      modulePre,
      defaultModule
    ]);

    await manager.uninstall();

    expect(order).toEqual([
      'modulePre',
      'defaultModule',
      'modulePost',
      'moduleFin'
    ]);
  });
});
