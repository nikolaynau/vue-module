import { type InjectionKey, provide, inject } from 'vue';
import type { ModuleScope } from '@vuemodule/core';

export const moduleScopeKey: InjectionKey<ModuleScope> = Symbol();

export function provideModuleScope(moduleManager: ModuleScope) {
  provide(moduleScopeKey, moduleManager);
}

export function useModuleScope(): ModuleScope | undefined {
  return inject(moduleScopeKey);
}
