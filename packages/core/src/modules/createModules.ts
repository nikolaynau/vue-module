import type { ModuleInstance, ModuleManager, ModuleScope } from '../types';
import { createScope } from './createScope';
import { ModuleManagerClass } from './moduleManager';

export function createModules(
  modules: ModuleInstance[],
  scope?: ModuleScope
): ModuleManager {
  const manager = new ModuleManagerClass(modules);
  if (!scope) {
    scope = createScope(manager);
  }
  manager.setScope(scope);
  return manager;
}
