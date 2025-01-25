import type { ModuleHookConfig, ModuleMeta } from './types';

export interface ModuleInternalContext {
  meta: ModuleMeta;
  hooks: ModuleHookConfig[];
}

let activeContext: ModuleInternalContext | undefined = undefined;
export function setActiveContext(
  context: ModuleInternalContext | undefined
): void {
  activeContext = context;
}

export function getActiveContext(): ModuleInternalContext | undefined {
  return activeContext;
}

export function createInternalContext(): ModuleInternalContext {
  return {
    meta: {},
    hooks: []
  };
}

export function setVersion(version: string | undefined): void {
  if (activeContext) {
    activeContext.meta.version = version;
  }
}

export function setName(name: string | undefined): void {
  if (activeContext) {
    activeContext.meta.name = name;
  }
}

export function setMeta(meta: ModuleMeta): void {
  if (activeContext) {
    Object.assign(activeContext.meta, meta);
  }
}
