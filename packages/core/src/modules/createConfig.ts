import type {
  ModuleConfig,
  ModuleDep,
  ModuleLoadConfig,
  ModuleLoader,
  ModuleOptions,
  ModuleEnforce,
  ModuleSetupReturn,
  ModuleScope,
  ModuleId
} from '../types';
import { isModuleLoader } from '../module';
import { newId } from '../utils';

export function createConfig<
  T extends ModuleOptions = ModuleOptions,
  R extends ModuleSetupReturn = ModuleSetupReturn
>(
  loaderOrConfig: ModuleLoader<T, R> | ModuleLoadConfig<T, R>,
  optionsOrDep?: T | ModuleDep,
  ...moduleDeps: ModuleDep[]
): ModuleConfig<T, R> {
  const { loader, options, enforce, deps, scope, id } = parseLoaderConfig(
    loaderOrConfig,
    optionsOrDep,
    moduleDeps
  );

  if (!loader) {
    throw new Error('Loader is required.');
  }

  const config: ModuleConfig<T, R> = {
    id: id ?? newId(),
    loader,
    options,
    enforce,
    deps,
    resolved: undefined,
    scope
  };

  return config;
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
  let enforce: ModuleEnforce | undefined = undefined;
  let scope: ModuleScope | undefined = undefined;
  let id: ModuleId | undefined = undefined;
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
    scope = loaderOrConfig.scope;
    id = loaderOrConfig.id;

    if (Array.isArray(loaderOrConfig.deps)) {
      deps.push(...loaderOrConfig.deps);
    }

    if (typeof loaderOrConfig.options === 'function') {
      options = loaderOrConfig.options;
    } else if (loaderOrConfig.options) {
      options = { ...loaderOrConfig.options };
    }
  }

  return { loader, options, enforce, deps, scope, id };
}
