import {
  computed,
  markRaw,
  ref,
  shallowRef,
  type ComputedRef,
  type Ref
} from 'vue';
import {
  createModule,
  isModuleConfig,
  isModuleInstance,
  isModuleLoader
} from '@vuemodule/core';
import type {
  AnyOrNeverModuleKey,
  Awaitable,
  ModuleDep,
  ModuleInstance,
  ModuleKey,
  ModuleLoadConfig,
  ModuleLoader,
  ModuleMeta,
  ModuleOptions,
  ModuleSetupReturn,
  ModuleValue
} from '@vuemodule/core';
import { useModuleScope } from '../inject';

export interface UseModuleReturn<
  I extends ModuleInstance<any, any>,
  HasInstance extends boolean = true
> {
  hasModule: ComputedRef<boolean>;
  instance: HasInstance extends true ? Ref<I> : Ref<I | undefined>;
  data: ComputedRef<ExtractModuleExports<I> | undefined>;
  isReady: Ref<boolean>;
  isLoading: Ref<boolean>;
  error: Ref<unknown>;
  install: () => Promise<void>;
  uninstall: () => Promise<void>;
}

export interface UseModuleOptions {
  immediate?: boolean;
  skipScope?: boolean;
}

export interface UseModuleOptionsWithModuleOptions<
  T extends ModuleOptions = ModuleOptions
> extends UseModuleOptions {
  moduleOptions?: ((meta?: ModuleMeta) => Awaitable<T>) | T;
}

type ExtractModuleExports<I> =
  I extends ModuleInstance<any, infer R> ? R : never;

export function useModule<K extends ModuleKey>(
  name: K,
  options?: UseModuleOptions
): UseModuleReturn<ModuleInstance<ModuleOptions, ModuleValue<K>>, false>;

export function useModule(
  name: AnyOrNeverModuleKey,
  options?: UseModuleOptions
): UseModuleReturn<ModuleInstance, false>;

export function useModule<
  T extends ModuleOptions = ModuleOptions,
  R extends ModuleSetupReturn = ModuleSetupReturn
>(
  config: ModuleLoadConfig<T, R>,
  options?: UseModuleOptions
): UseModuleReturn<ModuleInstance<T, R>>;

export function useModule<
  T extends ModuleOptions = ModuleOptions,
  R extends ModuleSetupReturn = ModuleSetupReturn
>(
  module: ModuleInstance<T, R>,
  options?: UseModuleOptions
): UseModuleReturn<ModuleInstance<T, R>>;

export function useModule<
  T extends ModuleOptions = ModuleOptions,
  R extends ModuleSetupReturn = ModuleSetupReturn,
  O extends
    UseModuleOptionsWithModuleOptions<T> = UseModuleOptionsWithModuleOptions<T>
>(
  loader: ModuleLoader<T, R>,
  options?: O
): UseModuleReturn<ModuleInstance<T, R>>;

export function useModule<
  T extends ModuleOptions = ModuleOptions,
  R extends ModuleSetupReturn = ModuleSetupReturn,
  O extends
    UseModuleOptionsWithModuleOptions<T> = UseModuleOptionsWithModuleOptions<T>
>(
  loader: ModuleLoader<T, R>,
  deps: ModuleDep[],
  options?: O
): UseModuleReturn<ModuleInstance<T, R>>;

export function useModule(
  ...args: any[]
):
  | UseModuleReturn<ModuleInstance<any, any>>
  | UseModuleReturn<ModuleInstance<any, any>, false> {
  let instance: ModuleInstance<any, any> | undefined;
  let options: UseModuleOptionsWithModuleOptions<any> | undefined;

  const scope = useModuleScope();

  const [firstArg, secondArg, thirdArg] = args;
  const hasName = typeof firstArg === 'string';

  if (hasName) {
    instance = scope?.modules.get(firstArg);
    options = secondArg;
  } else if (isModuleConfig(firstArg)) {
    instance = createModule(firstArg);
    options = secondArg;
  } else if (isModuleInstance(firstArg)) {
    instance = firstArg;
    options = secondArg;
  } else if (isModuleLoader(firstArg)) {
    const deps = Array.isArray(secondArg) ? secondArg : undefined;
    options = deps ? thirdArg : secondArg;
    const moduleOptions = options?.moduleOptions;

    instance = createModule({
      loader: firstArg,
      deps,
      options: moduleOptions
    });
  }

  const { immediate = true, skipScope } = options ?? {};

  if (instance && !skipScope && !hasName) {
    scope?.modules.add(instance);
  }

  const instanceRef = shallowRef(instance ? markRaw(instance) : undefined);
  const hasModule = computed(() => !!instanceRef.value);
  const isInstalled = !!instanceRef.value?.isInstalled();

  const isReady = ref(isInstalled);
  const isLoading = ref(false);
  const error = ref<unknown>(undefined);

  const data = computed(() =>
    isReady.value ? instanceRef.value?.exports : undefined
  );

  async function install(): Promise<void> {
    if (!instanceRef.value || isLoading.value) {
      return;
    }

    isLoading.value = true;
    isReady.value = false;
    error.value = undefined;

    try {
      await instanceRef.value.install();
      isReady.value = true;
    } catch (e) {
      error.value = e;
    } finally {
      isLoading.value = false;
    }
  }

  async function uninstall(): Promise<void> {
    if (!instanceRef.value || isLoading.value) {
      return;
    }

    isLoading.value = true;
    isReady.value = false;
    error.value = undefined;

    try {
      await instanceRef.value.uninstall();
    } catch (e) {
      error.value = e;
    } finally {
      isLoading.value = false;
    }
  }

  if (immediate && !isInstalled) {
    install();
  }

  return {
    hasModule,
    instance: instanceRef,
    data,
    isReady,
    isLoading,
    error,
    install,
    uninstall
  };
}
