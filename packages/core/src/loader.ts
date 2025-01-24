import type { ModuleConfig, ModuleOptions, ModuleSetupReturn } from './types';

export async function loadModule<
  T extends ModuleOptions,
  R extends ModuleSetupReturn
>(config: ModuleConfig<T, R>): Promise<ModuleConfig<T, R>> {
  return Promise.resolve(config);
}
