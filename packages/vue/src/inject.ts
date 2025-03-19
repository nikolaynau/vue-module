import { type InjectionKey, inject } from 'vue';
import type { ModuleScope } from '@vuemodule/core';

export const moduleScopeKey: InjectionKey<ModuleScope> = Symbol();

export function useModuleScope(): ModuleScope {
  const scope = inject(moduleScopeKey);
  if (!scope) {
    throw new Error('ModuleScope is not provided');
  }
  return scope;
}
