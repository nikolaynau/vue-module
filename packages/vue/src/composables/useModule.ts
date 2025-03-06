import type { ComputedRef, Ref } from 'vue';
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

export interface UseModuleReturn<
  I extends ModuleInstance<any, any>,
  K extends string = string,
  HasInstance extends boolean = true
> {
  hasModule: ComputedRef<boolean>;
  instance: HasInstance extends true ? Ref<I> : Ref<I | undefined>;
  name: ComputedRef<K>;
  data: ComputedRef<ExtractModuleExports<I> | undefined>;
  options: ComputedRef<ExtractModuleOptions<I> | undefined>;
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

type ExtractModuleOptions<I> =
  I extends ModuleInstance<infer T, any> ? T : never;
type ExtractModuleExports<I> =
  I extends ModuleInstance<any, infer R> ? R : never;

export function useModule<K extends ModuleKey>(
  name: K,
  options?: UseModuleOptions
): UseModuleReturn<ModuleInstance<ModuleOptions, ModuleValue<K>>, K, false>;

export function useModule(
  name: AnyOrNeverModuleKey,
  options?: UseModuleOptions
): UseModuleReturn<ModuleInstance, string, false>;

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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function useModule(...args: any[]): any {}
