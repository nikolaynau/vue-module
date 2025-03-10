// import type { ComputedRef, Ref } from 'vue';
// import {
//   createModule,
//   isModuleConfig,
//   isModuleInstance,
//   isModuleLoader,
//   type AnyOrNeverModuleKey,
//   type Awaitable,
//   type ModuleDep,
//   type ModuleInstance,
//   type ModuleKey,
//   type ModuleLoadConfig,
//   type ModuleLoader,
//   type ModuleMeta,
//   type ModuleOptions,
//   type ModuleSetupReturn,
//   type ModuleValue
// } from '@vuemodule/core';
// import { useModuleScope } from '../inject';

// export interface UseModuleReturn<
//   I extends ModuleInstance<any, any>,
//   K extends string = string,
//   HasInstance extends boolean = true
// > {
//   hasModule: ComputedRef<boolean>;
//   instance: HasInstance extends true ? Ref<I> : Ref<I | undefined>;
//   data: ComputedRef<ExtractModuleExports<I> | undefined>;
//   isReady: Ref<boolean>;
//   isLoading: Ref<boolean>;
//   error: Ref<unknown>;
//   install: () => Promise<void>;
//   uninstall: () => Promise<void>;
// }

// export interface UseModuleOptions {
//   immediate?: boolean;
//   skipScope?: boolean;
// }

// export interface UseModuleOptionsWithModuleOptions<
//   T extends ModuleOptions = ModuleOptions
// > extends UseModuleOptions {
//   moduleOptions?: ((meta?: ModuleMeta) => Awaitable<T>) | T;
// }

// type ExtractModuleOptions<I> =
//   I extends ModuleInstance<infer T, any> ? T : never;
// type ExtractModuleExports<I> =
//   I extends ModuleInstance<any, infer R> ? R : never;

// export function useModule<K extends ModuleKey>(
//   name: K,
//   options?: UseModuleOptions
// ): UseModuleReturn<ModuleInstance<ModuleOptions, ModuleValue<K>>, K, false>;

// export function useModule(
//   name: AnyOrNeverModuleKey,
//   options?: UseModuleOptions
// ): UseModuleReturn<ModuleInstance, string, false>;

// export function useModule<
//   T extends ModuleOptions = ModuleOptions,
//   R extends ModuleSetupReturn = ModuleSetupReturn
// >(
//   config: ModuleLoadConfig<T, R>,
//   options?: UseModuleOptions
// ): UseModuleReturn<ModuleInstance<T, R>>;

// export function useModule<
//   T extends ModuleOptions = ModuleOptions,
//   R extends ModuleSetupReturn = ModuleSetupReturn
// >(
//   module: ModuleInstance<T, R>,
//   options?: UseModuleOptions
// ): UseModuleReturn<ModuleInstance<T, R>>;

// export function useModule<
//   T extends ModuleOptions = ModuleOptions,
//   R extends ModuleSetupReturn = ModuleSetupReturn,
//   O extends
//     UseModuleOptionsWithModuleOptions<T> = UseModuleOptionsWithModuleOptions<T>
// >(
//   loader: ModuleLoader<T, R>,
//   options?: O
// ): UseModuleReturn<ModuleInstance<T, R>>;

// export function useModule<
//   T extends ModuleOptions = ModuleOptions,
//   R extends ModuleSetupReturn = ModuleSetupReturn,
//   O extends
//     UseModuleOptionsWithModuleOptions<T> = UseModuleOptionsWithModuleOptions<T>
// >(
//   loader: ModuleLoader<T, R>,
//   deps: ModuleDep[],
//   options?: O
// ): UseModuleReturn<ModuleInstance<T, R>>;

// export function useModule(
//   ...args: any[]
// ): UseModuleReturn<ModuleInstance<any, any>, string, false> {
//   const scope = useModuleScope();
//   let instance: ModuleInstance<any, any> | undefined;
//   let options: UseModuleOptionsWithModuleOptions<any> | undefined;

//   const [firstArg, secondArg, thirdArg] = args;

//   if (typeof firstArg === 'string') {
//     instance = scope?.modules.get(firstArg);
//     options = secondArg;
//   } else if (isModuleConfig(firstArg)) {
//     instance = createModule(firstArg);
//     options = secondArg;
//   } else if (isModuleInstance(firstArg)) {
//     instance = firstArg;
//     options = secondArg;
//   } else if (isModuleLoader(firstArg)) {
//     const deps = Array.isArray(secondArg) ? secondArg : undefined;
//     options = deps ? thirdArg : secondArg;
//     instance = createModule({
//       loader: firstArg,
//       deps,
//       options: options?.moduleOptions
//     });
//   }

//   if (instance && !options?.skipScope) {
//     instance.setScope(scope);
//   }
// }
