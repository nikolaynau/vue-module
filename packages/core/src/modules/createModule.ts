import type {
  ModuleDep,
  ModuleHookType,
  ModuleInstance,
  ModuleLoadConfig,
  ModuleLoader,
  ModuleOptions,
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

  function isInstalled(): boolean {
    return isModuleInstalled(config);
  }

  async function install(): Promise<void> {
    if (!isInstalled()) {
      await loadModule(config);
      await callHooks('installed');
    }
  }

  async function uninstall(): Promise<void> {
    if (isInstalled()) {
      await callHooks('uninstall');
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

  function getId(): number | undefined {
    return config.id;
  }

  function getName(): string | undefined {
    return getModuleName(config);
  }

  function getExports(): R | undefined {
    return getModuleExports(config);
  }

  function getOptions(): T | undefined {
    return getModuleOptions(config);
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

  return {
    config,
    isInstalled,
    install,
    uninstall,
    equals,
    getId,
    getName,
    getExports,
    getOptions,
    callHooks,
    setIgnoreHookErrors,
    getHookErrors
  };
}
