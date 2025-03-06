import type {
  ModuleConfig,
  ModuleInstance,
  ModuleLoader,
  ModuleMeta,
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
>(value: unknown): value is ModuleLoader<T, R> {
  return typeof value === 'function';
}

export function isModuleInstance(value: any): value is ModuleInstance {
  return typeof value === 'object' && value !== null && 'config' in value;
}

export function isModuleConfig(value: any): value is ModuleConfig {
  return typeof value === 'object' && value !== null && 'loader' in value;
}

export function getModuleName(
  config: ModuleConfig<any, any>
): string | undefined {
  return config.resolved?.meta?.name;
}

export function getModuleVersion(
  config: ModuleConfig<any, any>
): string | undefined {
  return config.resolved?.meta?.version;
}

export function getModuleExports<R extends ModuleSetupReturn>(
  config: ModuleConfig<any, R>
): R | undefined {
  return config.resolved?.exports;
}

export function getModuleOptions<T extends ModuleOptions>(
  config: ModuleConfig<T, any>
): T | undefined {
  return config.resolved?.options;
}

export function getModuleMeta(
  config: ModuleConfig<any, any>
): ModuleMeta | undefined {
  return config.resolved?.meta;
}

export function moduleEquals(
  first?: ModuleConfig<any, any>,
  second?: ModuleConfig<any, any>
): boolean {
  return Boolean(
    first &&
      second &&
      (first === second || (first.id && second.id && first.id === second.id))
  );
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
