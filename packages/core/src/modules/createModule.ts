import type {
  InternalModuleManager,
  ModuleDep,
  ModuleHookType,
  ModuleInstance,
  ModuleLoadConfig,
  ModuleLoader,
  ModuleOptions,
  ModuleScope,
  ModuleSetupReturn
} from '../types';
import { callInstallHook, callUninstallHook } from '../hooks';
import { loadModule } from '../loader';
import {
  disposeModule,
  getModuleExports,
  getModuleName,
  getModuleOptions,
  isModuleInstalled,
  moduleEquals
} from '../module';
import { createConfig } from './createConfig';

export function createModule<
  T extends ModuleOptions = ModuleOptions,
  R extends ModuleSetupReturn = ModuleSetupReturn
>(config: ModuleLoadConfig<T, R>): ModuleInstance<T, R>;

export function createModule<
  T extends ModuleOptions = ModuleOptions,
  R extends ModuleSetupReturn = ModuleSetupReturn
>(loader: ModuleLoader<T, R>): ModuleInstance<T, R>;

export function createModule<
  T extends ModuleOptions = ModuleOptions,
  R extends ModuleSetupReturn = ModuleSetupReturn
>(loader: ModuleLoader<T, R>, options: T): ModuleInstance<T, R>;

export function createModule<
  T extends ModuleOptions = ModuleOptions,
  R extends ModuleSetupReturn = ModuleSetupReturn
>(loader: ModuleLoader<T, R>, ...deps: ModuleDep[]): ModuleInstance<T, R>;

export function createModule<
  T extends ModuleOptions = ModuleOptions,
  R extends ModuleSetupReturn = ModuleSetupReturn
>(
  loaderOrConfig: ModuleLoader<T, R> | ModuleLoadConfig<T, R>,
  optionsOrDep?: T | ModuleDep,
  ...moduleDeps: ModuleDep[]
): ModuleInstance<T, R> {
  const config = createConfig(loaderOrConfig, optionsOrDep, ...moduleDeps);

  let ignoreHookErrors = false;
  const hookErrors: Error[] = [];

  const instance: ModuleInstance<T, R> = {
    get config() {
      return config;
    },
    get id() {
      return config.id;
    },
    get name() {
      return getModuleName(config);
    },
    get exports() {
      return getModuleExports(config);
    },
    get options() {
      return getModuleOptions(config);
    },
    isInstalled,
    install,
    uninstall,
    equals,
    setScope,
    getScope,
    callHooks,
    setIgnoreHookErrors,
    getHookErrors
  };

  function isInstalled(): boolean {
    return isModuleInstalled(config);
  }

  async function install(): Promise<void> {
    if (!isInstalled()) {
      await loadModule(config);
      _postInstall();
      await callHooks('installed');
    }
  }

  async function uninstall(): Promise<void> {
    if (isInstalled()) {
      await callHooks('uninstall');
      _preDispose();
      disposeModule(config);
    }
  }

  async function callHooks(type: ModuleHookType): Promise<void> {
    if (type === 'installed') {
      await callInstallHook(config, ignoreHookErrors, hookErrors);
    } else if (type === 'uninstall') {
      await callUninstallHook(config, ignoreHookErrors, hookErrors);
    }
  }

  function setScope(scope: ModuleScope | undefined): void {
    config.scope = scope;
  }

  function getScope(): ModuleScope | undefined {
    return config.scope;
  }

  function equals(other?: ModuleInstance<any, any>): boolean {
    return moduleEquals(config, other?.config);
  }

  function setIgnoreHookErrors(value: boolean): void {
    ignoreHookErrors = value;
  }

  function getHookErrors(): Error[] {
    return hookErrors;
  }

  function _postInstall() {
    const internal = config.scope?.modules as InternalModuleManager;
    if (typeof internal?._postInstall === 'function') {
      internal._postInstall(instance);
    }
  }

  function _preDispose() {
    const internal = config.scope?.modules as InternalModuleManager;
    if (typeof internal?._preDispose === 'function') {
      internal._preDispose(instance);
    }
  }

  return instance;
}
