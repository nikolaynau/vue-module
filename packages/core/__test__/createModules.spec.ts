import { describe, it, expect, vi } from 'vitest';
import type {
  ModuleInstance,
  ModuleEnforce,
  ModuleConfig,
  ModuleScope
} from '../src/types';
import { createModules } from '../src/modules/createModules';

function createDummyModule(
  name: string,
  enforce?: ModuleEnforce
): ModuleInstance {
  let installed = false;
  const config = {
    resolved: { meta: { name } },
    loader: () => {},
    enforce
  } as ModuleConfig;
  return {
    config,
    async install() {
      installed = true;
    },
    async uninstall() {
      installed = false;
    },
    isInstalled() {
      return installed;
    },
    equals(other: ModuleInstance) {
      return other.config?.resolved?.meta?.name === name;
    },
    setScope: (scope: ModuleScope) => {
      config.scope = scope;
    }
  } as ModuleInstance;
}

describe('ModuleManager', () => {
  it('should initialize with provided modules', () => {
    const moduleA = createDummyModule('moduleA');
    const moduleB = createDummyModule('moduleB');
    const manager = createModules([moduleA, moduleB]);

    expect(manager.getSize()).toBe(2);
    expect(manager.isEmpty()).toBe(false);
    expect(manager.toArray()).toEqual([moduleA, moduleB]);

    const map = manager.toMap();
    expect(map.get('moduleA')).toEqual(moduleA);
    expect(map.get('moduleB')).toEqual(moduleB);

    expect(manager.getAt(0)).toEqual(moduleA);
    expect(manager.getAt(1)).toEqual(moduleB);
  });

  it('should retrieve a module by name, config, instance, and array of names', () => {
    const moduleA = createDummyModule('moduleA');
    const moduleB = createDummyModule('moduleB');
    const manager = createModules([moduleA, moduleB]);

    expect(manager.get('moduleA')).toEqual(moduleA);
    expect(manager.get(['moduleB'])).toEqual([moduleB]);
    expect(manager.get(moduleA)).toEqual(moduleA);
    expect(manager.get(moduleA.config)).toEqual(moduleA);
  });

  it('should correctly report existence using has()', () => {
    const moduleA = createDummyModule('moduleA');
    const manager = createModules([moduleA]);

    expect(manager.has('moduleA')).toBe(true);
    expect(manager.has(moduleA)).toBe(true);
    expect(manager.has(moduleA.config)).toBe(true);
    expect(manager.has('nonExistent')).toBe(false);
  });

  it('should add a module only once', () => {
    const moduleA = createDummyModule('moduleA');
    const manager = createModules([]);

    manager.add(moduleA);
    manager.add(moduleA);
    expect(manager.getSize()).toBe(1);
  });

  it('should remove a module by name, config, or instance', () => {
    const moduleA = createDummyModule('moduleA');
    const moduleB = createDummyModule('moduleB');
    const manager = createModules([moduleA, moduleB]);

    const removedA = manager.remove('moduleA');
    expect(removedA).toEqual(moduleA);
    expect(manager.getSize()).toBe(1);

    const removedB = manager.remove(moduleB.config);
    expect(removedB).toEqual(moduleB);
    expect(manager.getSize()).toBe(0);
  });

  it('should remove all modules', () => {
    const moduleA = createDummyModule('moduleA');
    const moduleB = createDummyModule('moduleB');
    const manager = createModules([moduleA, moduleB]);

    manager.removeAll();
    expect(manager.isEmpty()).toBe(true);
  });

  it('should return correct installed status', async () => {
    const moduleA = createDummyModule('moduleA');
    const manager = createModules([moduleA]);

    expect(manager.isInstalled()).toBe(false);

    await moduleA.install();
    expect(moduleA.isInstalled()).toBe(true);
    expect(manager.isInstalled()).toBe(true);
  });

  it('should install a single module when passed as an argument', async () => {
    const moduleA = createDummyModule('moduleA');

    moduleA.install = vi.fn().mockResolvedValue(undefined);
    const manager = createModules([]);

    await manager.install(moduleA);
    expect(moduleA.install).toHaveBeenCalled();
  });

  it('should uninstall a single module when passed as an argument', async () => {
    const moduleA = createDummyModule('moduleA');

    moduleA.uninstall = vi.fn().mockResolvedValue(undefined);
    const manager = createModules([moduleA]);

    await moduleA.install();
    expect(moduleA.isInstalled()).toBe(true);

    await manager.uninstall(moduleA);
    expect(moduleA.uninstall).toHaveBeenCalled();
  });

  it('should execute modules in enforce order during install', async () => {
    const order: string[] = [];

    const createTrackingModule = (
      name: string,
      enforce?: ModuleEnforce
    ): ModuleInstance => {
      const instance = createDummyModule(name, enforce);
      const superInstallFn = instance.install;
      instance.install = async () => {
        await superInstallFn();
        order.push(name);
      };
      const superUninstallFn = instance.uninstall;
      instance.uninstall = async () => {
        await superUninstallFn();
        order.push(name);
      };
      return instance;
    };

    const modulePre = createTrackingModule('modulePre', 'pre');
    const moduleDefault = createTrackingModule('moduleDefault');
    const modulePost = createTrackingModule('modulePost', 'post');
    const moduleFin = createTrackingModule('moduleFin', 'fin');

    const modules = [modulePost, moduleDefault, moduleFin, modulePre];
    const manager = createModules(modules);

    await manager.install(() => true, { parallel: true });

    expect(order).toEqual([
      'modulePre',
      'moduleDefault',
      'modulePost',
      'moduleFin'
    ]);
  });

  it('should execute modules in enforce order during uninstall', async () => {
    const order: string[] = [];

    const createTrackingModule = (
      name: string,
      enforce?: ModuleEnforce
    ): ModuleInstance => {
      const instance = createDummyModule(name, enforce);
      const superInstallFn = instance.install;
      instance.install = async () => {
        await superInstallFn();
        order.push(name);
      };
      const superUninstallFn = instance.uninstall;
      instance.uninstall = async () => {
        await superUninstallFn();
        order.push(name);
      };
      return instance;
    };

    const modulePre = createTrackingModule('modulePre', 'pre');
    const moduleDefault = createTrackingModule('moduleDefault');
    const modulePost = createTrackingModule('modulePost', 'post');
    const moduleFin = createTrackingModule('moduleFin', 'fin');

    const modules = [moduleDefault, moduleFin, modulePre, modulePost];
    const manager = createModules(modules);

    await manager.uninstall();

    expect(order).toEqual([
      'modulePre',
      'moduleDefault',
      'modulePost',
      'moduleFin'
    ]);
  });
});
