import type { ModuleManager } from '@vuemodule/core';
import { useModuleScope } from '../inject';

export function useModuleManager(): ModuleManager | undefined {
  return useModuleScope()?.modules;
}
