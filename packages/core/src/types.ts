export type Awaitable<T> = T | Promise<T>;

export type Arrayable<T> = T | T[];

export interface ModuleMeta {
  name?: string;
  version?: string;
  [key: string]: any;
}

export type ModuleOptions = Record<string, any>;

export type ModuleSetupReturn = Record<string, any>;

export interface ModuleMap {}

export type ModuleKeys = (keyof ModuleMap)[];

export type ModuleKey = keyof ModuleMap;

export type ModuleValue<K extends ModuleKey> = ModuleMap[K];

export type InferModuleValue<K> = K extends ModuleKey
  ? ModuleMap[K]
  : ModuleSetupReturn;

export type ConditionalModuleType<T, TrueType, FalseType> = T extends ModuleKey
  ? TrueType
  : FalseType;

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

export type ModuleLoadConfig<
  T extends ModuleOptions = ModuleOptions,
  R extends ModuleSetupReturn = ModuleSetupReturn
> = Omit<ModuleConfig<T, R>, 'resolved'>;

export interface ModuleConfig<
  T extends ModuleOptions = ModuleOptions,
  R extends ModuleSetupReturn = ModuleSetupReturn
> {
  loader: ModuleLoader<T, R>;
  options?: ((meta?: ModuleMeta) => Awaitable<T>) | T;
  enforce?: ModulePhase;
  deps?: ModuleDep[];
  resolved?: ResolvedModule<T, R>;
}

export type ModuleHookType = 'installed' | 'uninstall';

export type ModuleHookCallback<T = Arrayable<ModuleConfig>> = (
  config: T
) => Awaitable<any>;

export interface ModuleHookConfig<> {
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

export interface ModuleContext<T extends ModuleOptions = ModuleOptions> {
  meta: ModuleMeta;
  options: T;

  setName(name: string | undefined): void;

  setVersion(version: string | undefined): void;

  setMeta(meta: ModuleMeta): void;

  onInstalled: InstallHookCallback<T>;

  onUninstall: UninstallHookCallback<T>;
}

export interface InternalModuleContext<T extends ModuleOptions = ModuleOptions>
  extends ModuleContext<T> {
  _hooks: ModuleHookConfig[];
}

export interface InstallHookCallback<T extends ModuleOptions = ModuleOptions> {
  <K extends string[]>(
    name: [...K],
    fn: ModuleHookCallback<{
      [P in keyof K]: ConditionalModuleType<
        K[P],
        ModuleConfig<ModuleOptions, InferModuleValue<K[P]>>,
        ModuleConfig
      >;
    }>
  ): void;

  <K extends ModuleKey>(
    name: K,
    fn: ModuleHookCallback<ModuleConfig<ModuleOptions, ModuleValue<K>>>
  ): void;

  (name: 'any', fn: ModuleHookCallback<ModuleConfig>): void;

  (name: 'all', fn: ModuleHookCallback<ModuleConfig[]>): void;

  <T extends string>(name: T, fn: ModuleHookCallback<ModuleConfig>): void;

  (fn: ModuleHookCallback<ModuleConfig<T>>): void;
}

export interface UninstallHookCallback<
  T extends ModuleOptions = ModuleOptions
> {
  <K extends ModuleKey>(
    name: K,
    fn: ModuleHookCallback<ModuleConfig<ModuleOptions, ModuleValue<K>>>
  ): void;

  (name: 'any', fn: ModuleHookCallback<ModuleConfig>): void;

  <T extends string>(name: T, fn: ModuleHookCallback<ModuleConfig>): void;

  (fn: ModuleHookCallback<ModuleConfig<T>>): void;
}
