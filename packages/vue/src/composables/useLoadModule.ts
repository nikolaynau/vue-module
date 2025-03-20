import { computed, ref, type ComputedRef, type Ref } from 'vue';
import {
  createModule,
  isModuleConfig,
  isModuleInstance,
  isModuleLoader
} from '@vuemodule/core';
import type {
  ModuleDep,
  ModuleInstance,
  ModuleLoadConfig,
  ModuleLoader,
  ModuleOptions,
  ModuleScope,
  ModuleSetupReturn
} from '@vuemodule/core';

export interface UseLoadModuleReturn<I extends ModuleInstance<any, any>> {
  instance: I;
  data: ComputedRef<ExtractModuleExports<I> | undefined>;
  isReady: Ref<boolean>;
  isLoading: Ref<boolean>;
  error: Ref<unknown>;
  install: () => Promise<void>;
  uninstall: () => Promise<void>;
}

export interface UseLoadModuleOptions {
  immediate?: boolean;
  scope?: ModuleScope;
}

type ExtractModuleExports<I> =
  I extends ModuleInstance<any, infer R> ? R : never;

export function useLoadModule<
  T extends ModuleOptions = ModuleOptions,
  R extends ModuleSetupReturn = ModuleSetupReturn
>(
  config: ModuleLoadConfig<T, R>,
  options?: UseLoadModuleOptions
): UseLoadModuleReturn<ModuleInstance<T, R>>;

export function useLoadModule<
  T extends ModuleOptions = ModuleOptions,
  R extends ModuleSetupReturn = ModuleSetupReturn
>(
  module: ModuleInstance<T, R>,
  options?: UseLoadModuleOptions
): UseLoadModuleReturn<ModuleInstance<T, R>>;

export function useLoadModule<
  T extends ModuleOptions = ModuleOptions,
  R extends ModuleSetupReturn = ModuleSetupReturn
>(
  loader: ModuleLoader<T, R>,
  options?: UseLoadModuleOptions
): UseLoadModuleReturn<ModuleInstance<T, R>>;

export function useLoadModule<
  T extends ModuleOptions = ModuleOptions,
  R extends ModuleSetupReturn = ModuleSetupReturn
>(
  loader: ModuleLoader<T, R>,
  deps: ModuleDep[],
  options?: UseLoadModuleOptions
): UseLoadModuleReturn<ModuleInstance<T, R>>;

export function useLoadModule(
  ...args: any[]
): UseLoadModuleReturn<ModuleInstance<any, any>> {
  let instance: ModuleInstance<any, any> | undefined;
  let options: UseLoadModuleOptions | undefined;

  const [firstArg, secondArg, thirdArg] = args;

  if (isModuleConfig(firstArg)) {
    instance = createModule(firstArg);
    options = secondArg;
  } else if (isModuleInstance(firstArg)) {
    instance = firstArg;
    options = secondArg;
  } else if (isModuleLoader(firstArg)) {
    const deps = Array.isArray(secondArg) ? secondArg : undefined;
    options = deps ? thirdArg : secondArg;
    instance = createModule({
      loader: firstArg,
      deps
    });
  }

  if (!instance) {
    throw new Error('Module instance is not defined.');
  }

  const { immediate = true, scope } = options ?? {};

  if (scope) {
    instance.setScope(scope);
  }

  const isReady = ref(instance.isInstalled());
  const isLoading = ref(false);
  const error = ref<unknown>(undefined);

  const data = computed(() => (isReady.value ? instance.exports : undefined));

  async function install(): Promise<void> {
    if (isLoading.value) {
      return;
    }

    isLoading.value = true;
    isReady.value = false;
    error.value = undefined;

    try {
      await instance!.install();
      isReady.value = true;
    } catch (e) {
      error.value = e;
    } finally {
      isLoading.value = false;
    }
  }

  async function uninstall(): Promise<void> {
    if (isLoading.value) {
      return;
    }

    isLoading.value = true;
    isReady.value = false;
    error.value = undefined;

    try {
      await instance!.uninstall();
    } catch (e) {
      error.value = e;
    } finally {
      isLoading.value = false;
    }
  }

  if (immediate && !instance.isInstalled()) {
    install();
  }

  return {
    instance,
    data,
    isReady,
    isLoading,
    error,
    install,
    uninstall
  };
}
