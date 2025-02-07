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

export type ModuleEnforce = 'pre' | 'post' | 'fin';

export type ModuleLoaderResult<T> = T | { default: T };

export type ModuleLoader<
  T extends ModuleOptions = ModuleOptions,
  R extends ModuleSetupReturn = ModuleSetupReturn
> = () => Awaitable<ModuleLoaderResult<ModuleDefinition<T, R>>>;

export type ModuleLoadConfig<
  T extends ModuleOptions = ModuleOptions,
  R extends ModuleSetupReturn = ModuleSetupReturn
> = Omit<ModuleConfig<T, R>, 'resolved' | 'id' | 'scope'>;

export interface ModuleConfig<
  T extends ModuleOptions = ModuleOptions,
  R extends ModuleSetupReturn = ModuleSetupReturn
> {
  loader: ModuleLoader<T, R>;
  options?: ((meta?: ModuleMeta) => Awaitable<T>) | T;
  enforce?: ModuleEnforce;
  deps?: ModuleDep[];
  resolved?: ResolvedModule<T, R>;
  scope?: ModuleScope;
  id?: number;
}

export type ModuleHookType = 'installed' | 'uninstall';

export type ModuleHookCallback<T = Arrayable<ResolvedModule>> = (
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
  lockFor?: Map<number, boolean>;
  calledFor?: Map<number, boolean>;
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
        ResolvedModule<ModuleOptions, InferModuleValue<K[P]>>,
        ResolvedModule
      >;
    }>
  ): void;

  <K extends ModuleKey>(
    name: K,
    fn: ModuleHookCallback<ResolvedModule<ModuleOptions, ModuleValue<K>>>
  ): void;

  (name: 'any', fn: ModuleHookCallback<ResolvedModule>): void;

  (name: 'all', fn: ModuleHookCallback<ResolvedModule[]>): void;

  <T extends string>(name: T, fn: ModuleHookCallback<ResolvedModule>): void;

  (fn: ModuleHookCallback<ResolvedModule<T>>): void;
}

export interface UninstallHook<T extends ModuleOptions = ModuleOptions> {
  <K extends ModuleKey>(
    name: K,
    fn: ModuleHookCallback<ResolvedModule<ModuleOptions, ModuleValue<K>>>
  ): void;

  (name: 'any', fn: ModuleHookCallback<ResolvedModule>): void;

  <T extends string>(name: T, fn: ModuleHookCallback<ResolvedModule>): void;

  (fn: ModuleHookCallback<ResolvedModule<T>>): void;
}

export interface ModuleInstance<
  T extends ModuleOptions = ModuleOptions,
  R extends ModuleSetupReturn = ModuleSetupReturn
> {
  readonly config: ModuleConfig<T, R>;

  getId(): number | undefined;

  getName(): string | undefined;

  getExports(): R | undefined;

  getOptions(): T | undefined;

  equals(other?: ModuleInstance<any, any>): boolean;

  install(): Promise<void>;

  uninstall(): Promise<void>;

  isInstalled(): boolean;

  callHooks(type: ModuleHookType): Promise<void>;

  setIgnoreHookErrors: (value: boolean) => void;

  getHookErrors: () => Error[];
}

export interface ModuleManager {
  getScope(): ModuleScope | undefined;

  getSize(): number;
  isEmpty(): boolean;

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
    module: ModuleInstance<T, R>
  ): ModuleInstance<T, R> | undefined;
  get<K extends ModuleKey>(
    name: K[]
  ): ModuleInstance<ModuleOptions, ModuleValue<K>>[];
  get(name: string[]): ModuleInstance[];

  getAt(index: number): ModuleInstance | undefined;

  add<T extends ModuleOptions, R extends ModuleSetupReturn>(
    module: ModuleInstance<T, R>
  ): ModuleInstance<T, R>;

  remove<K extends ModuleKey>(
    name: K
  ): ModuleInstance<ModuleOptions, ModuleValue<K>> | undefined;
  remove(name: string): ModuleInstance | undefined;
  remove<T extends ModuleOptions, R extends ModuleSetupReturn>(
    config: ModuleConfig<T, R>
  ): ModuleInstance<T, R> | undefined;
  remove<T extends ModuleOptions, R extends ModuleSetupReturn>(
    module: ModuleInstance<T, R>
  ): ModuleInstance<T, R> | undefined;

  removeAll(): void;

  has(name: ModuleKey): boolean;
  has(name: string): boolean;
  has(config: ModuleConfig<any, any>): boolean;
  has(module: ModuleInstance<any, any>): boolean;

  isInstalled(): boolean;
  isInstalled(config: ModuleConfig): boolean;
  isInstalled(name: ModuleKey): boolean;
  isInstalled(name: string): boolean;

  install(
    filter?: (module: ModuleInstance) => boolean,
    options?: ModuleExecutionOptions
  ): Promise<void>;
  install(module: ModuleInstance): Promise<void>;

  uninstall(
    filter?: (module: ModuleInstance) => boolean,
    options?: ModuleErrorHandlingOptions
  ): Promise<void>;
  uninstall(config: ModuleConfig): Promise<void>;
  uninstall(name: ModuleKey): Promise<void>;
  uninstall(name: string): Promise<void>;
  uninstall(module: ModuleInstance): Promise<void>;
}

export interface ModuleScope {
  modules: ModuleManager;
}

export interface ModuleErrorHandlingOptions {
  suppressErrors?: boolean;
  errors?: Error[];
}

export interface ModuleExecutionOptions extends ModuleErrorHandlingOptions {
  parallel?: boolean;
}
