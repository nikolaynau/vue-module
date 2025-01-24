import { callInstallHook, callUninstallHook } from './hooks';
import { loadModule } from './loader';
import type {
  ModuleConfig,
  ModuleDep,
  ModuleLoadConfig,
  ModuleLoader,
  ModuleOptions,
  ModulePhase,
  ModuleSetupReturn
} from './types';

export interface ModuleInstance<
  T extends ModuleOptions = ModuleOptions,
  R extends ModuleSetupReturn = ModuleSetupReturn
> {
  config: ModuleConfig<T, R>;
  install: () => Promise<void>;
  uninstall: () => Promise<void>;
}

export function createModule<
  T extends ModuleOptions = ModuleOptions,
  R extends ModuleSetupReturn = ModuleSetupReturn
>(config: ModuleLoadConfig<T, R>): ModuleInstance;

export function createModule<
  T extends ModuleOptions = ModuleOptions,
  R extends ModuleSetupReturn = ModuleSetupReturn
>(loader: ModuleLoader<T, R>): ModuleInstance;

export function createModule<
  T extends ModuleOptions = ModuleOptions,
  R extends ModuleSetupReturn = ModuleSetupReturn
>(loader: ModuleLoader<T, R>, options: T): ModuleInstance;

export function createModule<
  T extends ModuleOptions = ModuleOptions,
  R extends ModuleSetupReturn = ModuleSetupReturn
>(loader: ModuleLoader<T, R>, ...deps: ModuleDep[]): ModuleInstance;

export function createModule<
  T extends ModuleOptions = ModuleOptions,
  R extends ModuleSetupReturn = ModuleSetupReturn
>(
  loaderOrConfig: ModuleLoader<T, R> | ModuleLoadConfig<T, R>,
  optionsOrDep?: T | ModuleDep,
  ...moduleDeps: ModuleDep[]
): ModuleInstance<T, R> {
  const { loader, options, enforce, deps } = parseLoaderConfig(
    loaderOrConfig,
    optionsOrDep,
    moduleDeps
  );

  if (!loader) {
    throw new Error('Loader is required.');
  }

  const config: ModuleConfig<T, R> = {
    loader,
    options,
    enforce,
    deps,
    resolved: undefined
  };

  async function install() {
    if (!config.resolved) {
      await loadModule(config);
      await callInstallHook(config);
    }
  }

  async function uninstall() {
    if (config.resolved) {
      await callUninstallHook(config);
      disposeModule(config);
    }
  }

  return {
    config,
    install,
    uninstall
  };
}

function parseLoaderConfig<
  T extends ModuleOptions,
  R extends ModuleSetupReturn
>(
  loaderOrConfig: ModuleLoader<T, R> | ModuleLoadConfig<T, R>,
  optionsOrDep?: T | ModuleDep,
  moduleDeps: ModuleDep[] = []
) {
  let loader: ModuleLoader<T, R> | undefined = undefined;
  let options: ModuleConfig<T, R>['options'] = undefined;
  let enforce: ModulePhase | undefined;
  const deps: ModuleDep[] = [];

  if (isModuleLoader<T, R>(loaderOrConfig)) {
    loader = loaderOrConfig;

    if (typeof optionsOrDep === 'function') {
      deps.push(optionsOrDep);
    } else if (optionsOrDep) {
      options = { ...optionsOrDep };
    }

    if (Array.isArray(moduleDeps)) {
      deps.push(...moduleDeps);
    }
  } else if (isModuleLoader(loaderOrConfig.loader)) {
    loader = loaderOrConfig.loader;
    enforce = loaderOrConfig.enforce;

    if (Array.isArray(loaderOrConfig.deps)) {
      deps.push(...loaderOrConfig.deps);
    }

    if (typeof loaderOrConfig.options === 'function') {
      options = loaderOrConfig.options;
    } else if (loaderOrConfig.options) {
      options = { ...loaderOrConfig.options };
    }
  }

  return { loader, options, enforce, deps };
}

function isModuleLoader<T extends ModuleOptions, R extends ModuleSetupReturn>(
  input: unknown
): input is ModuleLoader<T, R> {
  return typeof input === 'function';
}

function disposeModule<T extends ModuleOptions, R extends ModuleSetupReturn>(
  config: ModuleConfig<T, R>
): ModuleConfig<T, R> {
  const { resolved } = config;
  if (resolved && !resolved.disposed) {
    resolved.disposed = true;
    resolved.hooks = [];
    resolved.exports = undefined;
    resolved.meta = undefined;
    resolved.options = undefined;
    config.resolved = undefined;
  }
  return config;
}
