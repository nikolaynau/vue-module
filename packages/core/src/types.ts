/* eslint-disable @typescript-eslint/no-empty-object-type */
/* eslint-disable @typescript-eslint/no-explicit-any */

export interface ModuleMeta {
  name?: string;
  version?: string;
  [key: string]: any;
}

export type Awaitable<T> = T | Promise<T>;

export type ModuleOptions = Record<string, any>;

export type ModuleSetupReturn = Record<string, any>;

export interface ModuleContext<T extends ModuleOptions = ModuleOptions> {
  readonly options: Readonly<T>;
  readonly meta: Readonly<ModuleMeta>;
}

export type ModuleSetupFunction<
  T extends ModuleOptions = ModuleOptions,
  R extends ModuleSetupReturn = ModuleSetupReturn
> = (context: ModuleContext<T>) => Awaitable<void | false | R>;

export interface ModuleDefinition<
  T extends ModuleOptions = ModuleOptions,
  R extends ModuleSetupReturn = ModuleSetupReturn
> {
  meta?: ModuleMeta;
  setup?: ModuleSetupFunction<T, R>;
}

export type ModuleDep = () => Awaitable<any>;

export type ModulePhase = 'pre' | 'post' | 'fin';

export type ModuleLoaderResult<T> = T | { default: T };

export type ModuleLoader<
  T extends ModuleOptions = ModuleOptions,
  R extends ModuleSetupReturn = ModuleSetupReturn
> = () => Awaitable<ModuleLoaderResult<ModuleDefinition<T, R>>>;

export interface ModuleLoadConfig<
  T extends ModuleOptions = ModuleOptions,
  R extends ModuleSetupReturn = ModuleSetupReturn
> {
  loader: ModuleLoader<T, R>;
  options?: ((meta?: ModuleMeta) => Awaitable<T>) | T;
  enforce?: ModulePhase;
  deps?: ModuleDep[];
}

export interface ModuleConfig<
  T extends ModuleOptions = ModuleOptions,
  R extends ModuleSetupReturn = ModuleSetupReturn
> extends ModuleLoadConfig<T, R> {
  resolved?: ResolvedModule<T, R>;
}

export type ModuleHookType = 'installed';

export type ModuleHookCallback = () => Awaitable<any>;

export interface ModuleHookConfig {
  key: string | string[] | null;
  type: ModuleHookType;
  callback: ModuleHookCallback;
}

export interface ResolvedModule<
  T extends ModuleOptions = ModuleOptions,
  R extends ModuleSetupReturn = ModuleSetupReturn
> {
  options: T | undefined;
  exports: R | undefined;
  meta: ModuleMeta | undefined;
  hooks: ModuleHookConfig[];
  disposed: boolean;
}

export interface ModuleMap {}

export type ModuleKeys = (keyof ModuleMap)[];

export type ModuleKey = keyof ModuleMap;
