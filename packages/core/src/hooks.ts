import type { ModuleConfig, ModuleOptions, ModuleSetupReturn } from './types';

export async function callInstallHook<
  T extends ModuleOptions,
  R extends ModuleSetupReturn
>(config: ModuleConfig<T, R>): Promise<void> {
  console.log(config);
}

export async function callUninstallHook<
  T extends ModuleOptions,
  R extends ModuleSetupReturn
>(config: ModuleConfig<T, R>): Promise<void> {
  console.log(config);
}
