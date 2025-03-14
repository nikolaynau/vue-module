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

export type ModuleId = number | string;

export type InferModuleValue<K> = K extends ModuleKey
  ? ModuleMap[K]
  : ModuleSetupReturn;

export type ConditionalModuleType<T, TrueType, FalseType> = T extends ModuleKey
  ? TrueType
  : FalseType;

export interface ModuleTypeConfig {}

export type IsStrictMode = ModuleTypeConfig extends { strictMode: true }
  ? true
  : false;

export type AnyOrNeverModuleKey = IsStrictMode extends true ? never : string;

export type StrictOrAnyModuleKey = IsStrictMode extends true
  ? ModuleKey
  : string;

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
> = Omit<ModuleConfig<T, R>, 'resolved'>;

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
  id?: ModuleId;
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
  readonly meta: Readonly<ModuleMeta>;
  readonly options: Readonly<T>;

  setName(name: string | undefined): void;

  setVersion(version: string | undefined): void;

  setMeta(meta: ModuleMeta): void;

  onInstalled: InstallHook<T>;

  onUninstall: UninstallHook<T>;

  getModule<K extends ModuleKey, TOpt extends ModuleOptions = ModuleOptions>(
    name: K
  ): ModuleInstance<TOpt, ModuleValue<K>> | undefined;
  getModule(name: AnyOrNeverModuleKey): ModuleInstance | undefined;

  installModule: ModuleInstallFunction;

  getScope(): ModuleScope | undefined;
}

export interface InstallHook<T extends ModuleOptions = ModuleOptions> {
  <K extends StrictOrAnyModuleKey[]>(
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

  (name: AnyOrNeverModuleKey, fn: ModuleHookCallback<ResolvedModule>): void;

  (fn: ModuleHookCallback<ResolvedModule<T>>): void;
}

export interface UninstallHook<T extends ModuleOptions = ModuleOptions> {
  <K extends ModuleKey>(
    name: K,
    fn: ModuleHookCallback<ResolvedModule<ModuleOptions, ModuleValue<K>>>
  ): void;

  (name: 'any', fn: ModuleHookCallback<ResolvedModule>): void;

  (name: AnyOrNeverModuleKey, fn: ModuleHookCallback<ResolvedModule>): void;

  (fn: ModuleHookCallback<ResolvedModule<T>>): void;
}

export interface ModuleInstallFunction {
  <
    T extends ModuleOptions = ModuleOptions,
    R extends ModuleSetupReturn = ModuleSetupReturn
  >(
    config: ModuleLoadConfig<T, R>
  ): Promise<ModuleInstance<T, R>>;

  <
    T extends ModuleOptions = ModuleOptions,
    R extends ModuleSetupReturn = ModuleSetupReturn
  >(
    loader: ModuleLoader<T, R>
  ): Promise<ModuleInstance<T, R>>;

  <
    T extends ModuleOptions = ModuleOptions,
    R extends ModuleSetupReturn = ModuleSetupReturn
  >(
    loader: ModuleLoader<T, R>,
    options: T
  ): Promise<ModuleInstance<T, R>>;

  <
    T extends ModuleOptions = ModuleOptions,
    R extends ModuleSetupReturn = ModuleSetupReturn
  >(
    loader: ModuleLoader<T, R>,
    ...deps: ModuleDep[]
  ): Promise<ModuleInstance<T, R>>;

  <
    T extends ModuleOptions = ModuleOptions,
    R extends ModuleSetupReturn = ModuleSetupReturn
  >(
    module: ModuleInstance<T, R>
  ): Promise<ModuleInstance<T, R>>;
}

export interface ModuleInstance<
  T extends ModuleOptions = ModuleOptions,
  R extends ModuleSetupReturn = ModuleSetupReturn
> {
  readonly config: ModuleConfig<T, R>;

  readonly id: ModuleId;

  readonly name: string | undefined;

  readonly exports: R | undefined;

  readonly options: T | undefined;

  readonly meta: ModuleMeta | undefined;

  equals(other?: ModuleInstance<any, any>): boolean;

  setScope(scope: ModuleScope | undefined): void;

  getScope(): ModuleScope | undefined;

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
  get(name: AnyOrNeverModuleKey): ModuleInstance | undefined;
  get<T extends ModuleOptions, R extends ModuleSetupReturn>(
    config: ModuleConfig<T, R>
  ): ModuleInstance<T, R> | undefined;
  get<T extends ModuleOptions, R extends ModuleSetupReturn>(
    module: ModuleInstance<T, R>
  ): ModuleInstance<T, R> | undefined;
  get<K extends ModuleKey>(
    name: K[]
  ): ModuleInstance<ModuleOptions, ModuleValue<K>>[];
  get(name: AnyOrNeverModuleKey[]): ModuleInstance[];

  getAt(index: number): ModuleInstance | undefined;

  add<T extends ModuleOptions, R extends ModuleSetupReturn>(
    module: ModuleInstance<T, R>
  ): ModuleInstance<T, R>;

  remove<K extends ModuleKey>(
    name: K
  ): ModuleInstance<ModuleOptions, ModuleValue<K>> | undefined;
  remove(name: AnyOrNeverModuleKey): ModuleInstance | undefined;
  remove<T extends ModuleOptions, R extends ModuleSetupReturn>(
    config: ModuleConfig<T, R>
  ): ModuleInstance<T, R> | undefined;
  remove<T extends ModuleOptions, R extends ModuleSetupReturn>(
    module: ModuleInstance<T, R>
  ): ModuleInstance<T, R> | undefined;

  removeAll(): void;

  has(name: ModuleKey): boolean;
  has(name: AnyOrNeverModuleKey): boolean;
  has(config: ModuleConfig<any, any>): boolean;
  has(module: ModuleInstance<any, any>): boolean;

  isInstalled(): boolean;
  isInstalled(config: ModuleConfig<any, any>): boolean;
  isInstalled(name: ModuleKey): boolean;
  isInstalled(name: AnyOrNeverModuleKey): boolean;

  install(
    filter?: (module: ModuleInstance) => boolean,
    options?: ModuleExecutionOptions
  ): Promise<void>;
  install(module: ModuleInstance<any, any>): Promise<void>;

  uninstall(
    filter?: (module: ModuleInstance) => boolean,
    options?: ModuleErrorHandlingOptions
  ): Promise<void>;
  uninstall(config: ModuleConfig<any, any>): Promise<void>;
  uninstall(name: ModuleKey): Promise<void>;
  uninstall(name: AnyOrNeverModuleKey): Promise<void>;
  uninstall(module: ModuleInstance<any, any>): Promise<void>;
}

export interface InternalModuleManager extends ModuleManager {
  _postInstall(module: ModuleInstance<any, any>): void;
  _preDispose(module: ModuleInstance<any, any>): void;
}

export interface ModuleScope {
  modules: ModuleManager;
}

export type ModuleEntry<
  T extends ModuleOptions = ModuleOptions,
  R extends ModuleSetupReturn = ModuleSetupReturn
> =
  | ModuleLoader<T, R>
  | ModuleLoadConfig<T, R>
  | [ModuleLoader<T, R>, T]
  | [ModuleLoader<T, R>, ...ModuleDep[]]
  | ModuleInstance<T, R>;

export interface ModuleErrorHandlingOptions {
  suppressErrors?: boolean;
  errors?: Error[];
}

export interface ModuleExecutionOptions extends ModuleErrorHandlingOptions {
  parallel?: boolean;
}
