import type {
  ModuleDep,
  ModuleInstance,
  ModuleLoadConfig,
  ModuleLoader,
  ModuleOptions,
  ModuleSetupReturn
} from '../types';
import { createConfig } from './createConfig';
import { ModuleClass } from './moduleInstance';

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
  return new ModuleClass(
    createConfig(loaderOrConfig, optionsOrDep, ...moduleDeps)
  );
}
