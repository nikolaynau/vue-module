export interface ModuleMeta {
  name?: string;
  version?: string;
  [key: string]: unknown;
}

export type Awaitable<T> = T | Promise<T>;

export type ModuleOptions = Record<string, unknown>;

export type ModuleSetupReturn = Record<string, unknown>;

export interface ModuleContext<T extends ModuleOptions = ModuleOptions> {
  options: T;
  meta: ModuleMeta;
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

export type ModuleDep = () => Awaitable<unknown>;

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

export type ModuleHookCallback = (
  moduleConfig?: ModuleConfig | ModuleConfig[]
) => Awaitable<void | unknown>;

export interface ModuleHookConfig {
  callback: ModuleHookCallback;
}

export interface ResolvedModule<
  T extends ModuleOptions = ModuleOptions,
  R extends ModuleSetupReturn = ModuleSetupReturn
> {
  options?: T;
  exports?: R;
  meta?: ModuleMeta;
  hooks?: ModuleHookConfig[];
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ModuleMap extends Record<string, unknown> {}
