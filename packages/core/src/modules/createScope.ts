import type { ModuleManager, ModuleScope } from '../types';

export function createScope(modules: ModuleManager): ModuleScope {
  return { modules };
}
