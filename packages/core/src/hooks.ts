import { getActiveContext } from './context';
import type {
  ModuleConfig,
  ModuleHookCallback,
  ModuleKey,
  ModuleOptions,
  ModuleSetupReturn
} from './types';

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

export function onInstalled<K extends ModuleKey>(
  name: K | K[],
  fn: ModuleHookCallback
): void;
export function onInstalled(name: 'all', fn: ModuleHookCallback): void;
export function onInstalled<T = string>(
  name: T | T[],
  fn: ModuleHookCallback
): void;
export function onInstalled(fn: ModuleHookCallback): void;
export function onInstalled(
  nameOrFn: string | string[] | ModuleHookCallback,
  fn?: ModuleHookCallback
): void {
  const activeContext = getActiveContext();
  if (!activeContext) {
    return;
  }

  if (typeof nameOrFn === 'function') {
    activeContext.hooks.push({
      key: null,
      type: 'installed',
      callback: nameOrFn
    });
  } else if (
    (typeof nameOrFn === 'string' || Array.isArray(nameOrFn)) &&
    typeof fn === 'function'
  ) {
    activeContext.hooks.push({
      key: nameOrFn,
      type: 'installed',
      callback: fn
    });
  }
}
