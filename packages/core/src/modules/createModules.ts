import type { ModuleInstance, ModuleManager } from '../types';
import { createScope } from './createScope';
import { ModuleManagerClass } from './moduleManager';

export function createModules(modules: ModuleInstance[]): ModuleManager {
  const manager = new ModuleManagerClass(modules);
  manager.setScope(createScope(manager));
  return manager;
}
