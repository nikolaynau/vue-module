import type {
  ModuleConfig,
  ModuleLoader,
  ModuleOptions,
  ModuleSetupReturn
} from './types';

export function isModuleInstalled(config: ModuleConfig<any, any>): boolean {
  return Boolean(config.resolved);
}

export function isModuleDisposed(config: ModuleConfig<any, any>): boolean {
  return Boolean(config.resolved?.disposed);
}

export function isModuleLoader<
  T extends ModuleOptions,
  R extends ModuleSetupReturn
>(input: unknown): input is ModuleLoader<T, R> {
  return typeof input === 'function';
}

export function disposeModule(config: ModuleConfig<any, any>): void {
  if (isModuleInstalled(config) && !isModuleDisposed(config)) {
    const { resolved } = config;
    resolved!.disposed = true;
    resolved!.hooks.length = 0;
    resolved!.exports = undefined;
    resolved!.meta = undefined;
    resolved!.options = undefined;
    config.resolved = undefined;
  }
}
