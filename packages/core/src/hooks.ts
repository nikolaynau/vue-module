import { getActiveContext } from './context';
import type {
  ConditionalModuleType,
  InferModuleValue,
  ModuleConfig,
  ModuleHookCallback,
  ModuleHookType,
  ModuleKey,
  ModuleOptions,
  ModuleSetupReturn,
  ModuleValue
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

export function onInstalled<K extends string[]>(
  name: [...K],
  fn: ModuleHookCallback<{
    [P in keyof K]: ConditionalModuleType<
      K[P],
      ModuleConfig<ModuleOptions, InferModuleValue<K[P]>>,
      ModuleConfig
    >;
  }>
): void;

export function onInstalled<K extends ModuleKey>(
  name: K,
  fn: ModuleHookCallback<ModuleConfig<ModuleOptions, ModuleValue<K>>>
): void;

export function onInstalled(
  name: 'any',
  fn: ModuleHookCallback<ModuleConfig>
): void;

export function onInstalled(
  name: 'all',
  fn: ModuleHookCallback<ModuleConfig[]>
): void;

export function onInstalled<T extends string>(
  name: T,
  fn: ModuleHookCallback<ModuleConfig>
): void;

export function onInstalled(fn: ModuleHookCallback<ModuleConfig>): void;

export function onInstalled(nameOrFn: unknown, fn?: unknown): void {
  onHook('installed', nameOrFn, fn);
}

export function onUninstall<K extends ModuleKey>(
  name: K,
  fn: ModuleHookCallback<ModuleConfig<ModuleOptions, ModuleValue<K>>>
): void;

export function onUninstall(
  name: 'any',
  fn: ModuleHookCallback<ModuleConfig>
): void;

export function onUninstall<T extends string>(
  name: T,
  fn: ModuleHookCallback<ModuleConfig>
): void;

export function onUninstall(fn: ModuleHookCallback<ModuleConfig>): void;

export function onUninstall(nameOrFn: unknown, fn?: unknown): void {
  onHook('uninstall', nameOrFn, fn);
}

function onHook(type: ModuleHookType, nameOrFn: unknown, fn?: unknown): void {
  const activeContext = getActiveContext();
  if (!activeContext) {
    return;
  }

  if (typeof nameOrFn === 'function') {
    activeContext.hooks.push({
      key: null,
      type,
      callback: nameOrFn as ModuleHookCallback
    });
  } else if (
    (typeof nameOrFn === 'string' || Array.isArray(nameOrFn)) &&
    typeof fn === 'function'
  ) {
    activeContext.hooks.push({
      key: nameOrFn,
      type,
      callback: fn as ModuleHookCallback
    });
  }
}
