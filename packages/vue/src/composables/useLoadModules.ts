import { ref, type Ref } from 'vue';
import type { ModuleExecutionOptions, ModuleInstance } from '@vuemodule/core';
import { useModuleManager } from './useModuleManager';

export interface UseLoadModulesOptions extends ModuleExecutionOptions {
  immediate?: boolean;
  filter?: (instance: ModuleInstance) => boolean;
}

export interface UseLoadModulesReturn {
  isLoading: Ref<boolean>;
  isReady: Ref<boolean>;
  error: Ref<unknown>;
  execute: () => Promise<void>;
}

export function useLoadModules(
  options: UseLoadModulesOptions = {}
): UseLoadModulesReturn {
  const { immediate = true, filter, ...executionOptions } = options;

  const modules = useModuleManager();
  const isLoading = ref(false);
  const isReady = ref(false);
  const error = ref<unknown>(undefined);

  async function execute() {
    if (isLoading.value) {
      return;
    }

    isLoading.value = true;
    isReady.value = false;
    error.value = undefined;

    try {
      await modules.install(filter, executionOptions);
      isReady.value = true;
    } catch (e) {
      error.value = e;
    } finally {
      isLoading.value = false;
    }
  }

  if (immediate) {
    execute();
  }

  return {
    isLoading,
    isReady,
    error,
    execute
  };
}
