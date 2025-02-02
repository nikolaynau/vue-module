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
  scope?: ModuleScope;
}

export type ModuleHookType = 'installed' | 'uninstall';

export type ModuleHookCallback<T = Arrayable<ModuleInstance>> = (
  module: T
) => Awaitable<any>;

export enum ModuleHookKey {
  All = 'all',
  Any = 'any'
}

export interface ModuleHookConfig {
  key: string | string[] | null;
  type: ModuleHookType;
  callback: ModuleHookCallback;
  lock?: boolean;
  called?: boolean;
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

  onInstalled: InstallHook<T>;

  onUninstall: UninstallHook<T>;
}

export interface InternalModuleContext<T extends ModuleOptions = ModuleOptions>
  extends ModuleContext<T> {
  _hooks: ModuleHookConfig[];
}

export interface InstallHook<T extends ModuleOptions = ModuleOptions> {
  <K extends string[]>(
    name: [...K],
    fn: ModuleHookCallback<{
      [P in keyof K]: ConditionalModuleType<
        K[P],
        ModuleInstance<ModuleOptions, InferModuleValue<K[P]>>,
        ModuleInstance
      >;
    }>
  ): void;

  <K extends ModuleKey>(
    name: K,
    fn: ModuleHookCallback<ModuleInstance<ModuleOptions, ModuleValue<K>>>
  ): void;

  (name: 'any', fn: ModuleHookCallback<ModuleInstance>): void;

  (name: 'all', fn: ModuleHookCallback<ModuleInstance[]>): void;

  <T extends string>(name: T, fn: ModuleHookCallback<ModuleInstance>): void;

  (fn: ModuleHookCallback<ModuleInstance<T>>): void;
}

export interface UninstallHook<T extends ModuleOptions = ModuleOptions> {
  <K extends ModuleKey>(
    name: K,
    fn: ModuleHookCallback<ModuleInstance<ModuleOptions, ModuleValue<K>>>
  ): void;

  (name: 'any', fn: ModuleHookCallback<ModuleInstance>): void;

  <T extends string>(name: T, fn: ModuleHookCallback<ModuleInstance>): void;

  (fn: ModuleHookCallback<ModuleInstance<T>>): void;
}

export interface ModuleState<
  T extends ModuleOptions = ModuleOptions,
  R extends ModuleSetupReturn = ModuleSetupReturn
> {
  readonly config: ModuleConfig<T, R>;
  readonly meta: ResolvedModule<T, R>['meta'];
  readonly name: ModuleMeta['name'];
  readonly version: ModuleMeta['version'];
  readonly exports: ResolvedModule<T, R>['exports'];
  readonly options: ResolvedModule<T, R>['options'];
  readonly hooks: ResolvedModule<T, R>['hooks'] | undefined;
  readonly scope: ModuleConfig<T, R>['scope'];
  readonly isInstalled: boolean;
}

export interface ModuleInstance<
  T extends ModuleOptions = ModuleOptions,
  R extends ModuleSetupReturn = ModuleSetupReturn
> extends ModuleState<T, R> {
  install(): Promise<void>;
  uninstall(): Promise<void>;
}

export interface ModuleManager {
  readonly size: number;
  readonly isEmpty: boolean;

  setScope(scope: ModuleScope): void;
  getScope(): ModuleScope | undefined;

  toArray(): ModuleInstance[];
  toMap(): Map<string, ModuleInstance>;

  get<K extends ModuleKey>(
    name: K
  ): ModuleInstance<ModuleOptions, ModuleValue<K>> | undefined;
  get(name: string): ModuleInstance | undefined;
  get<T extends ModuleOptions, R extends ModuleSetupReturn>(
    config: ModuleConfig<T, R>
  ): ModuleInstance<T, R> | undefined;
  get<T extends ModuleOptions, R extends ModuleSetupReturn>(
    instance: ModuleInstance<T, R>
  ): ModuleInstance<T, R> | undefined;

  getAt(index: number): ModuleInstance | undefined;

  add<T extends ModuleOptions, R extends ModuleSetupReturn>(
    instance: ModuleInstance<T, R>
  ): ModuleInstance<T, R>;

  remove<K extends ModuleKey>(
    name: K
  ): ModuleInstance<ModuleOptions, ModuleValue<K>> | undefined;
  remove(name: string): ModuleInstance | undefined;
  remove(config: ModuleConfig): ModuleInstance | undefined;
  remove(instance: ModuleInstance): ModuleInstance | undefined;

  removeAll(): void;

  has(name: ModuleKey): boolean;
  has(name: string): boolean;
  has(config: ModuleConfig<any, any>): boolean;
  has(instance: ModuleInstance<any, any>): boolean;

  isInstalled(): boolean;
  isInstalled(config: ModuleConfig): boolean;
  isInstalled(name: ModuleKey): boolean;
  isInstalled(name: string): boolean;

  install(instance: ModuleInstance): Promise<void>;

  uninstall(config: ModuleConfig): Promise<void>;
  uninstall(name: ModuleKey): Promise<void>;
  uninstall(name: string): Promise<void>;
  uninstall(instance: ModuleInstance): Promise<void>;

  bulkInstall(
    filter?: (instance: ModuleInstance) => boolean,
    options?: ModuleExecutionOptions
  ): Promise<void>;
  bulkUninstall(
    filter?: (instance: ModuleInstance) => boolean,
    options?: ModuleExecutionOptions
  ): Promise<void>;
}

export interface ModuleScope {
  modules: ModuleManager;
}

export interface ModuleExecutionOptions {
  parallel?: boolean;
  suppressErrors?: boolean;
  errors?: Error[];
}

export type ModuleErrorHandlingOptions = Omit<
  ModuleExecutionOptions,
  'parallel'
>;
