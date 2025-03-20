import type {
  AnyOrNeverModuleKey,
  ModuleInstance,
  ModuleKey,
  ModuleOptions,
  ModuleSetupReturn,
  ModuleValue
} from '@vuemodule/core';
import { useModuleManager } from './useModuleManager';

export interface UseModuleOptions {
  controls?: boolean;
}

export function useModule<K extends ModuleKey>(
  name: K,
  options: UseModuleOptions & { controls: true }
): ModuleInstance<ModuleOptions, ModuleValue<K>> | undefined;

export function useModule(
  name: AnyOrNeverModuleKey,
  options: UseModuleOptions & { controls: true }
): ModuleInstance | undefined;

export function useModule<K extends ModuleKey>(
  name: K,
  options?: UseModuleOptions & { controls?: false }
): ModuleValue<K> | undefined;

export function useModule(
  name: AnyOrNeverModuleKey,
  options?: UseModuleOptions & { controls?: false }
): ModuleSetupReturn | undefined;

export function useModule(
  name: string,
  options: UseModuleOptions = {}
): ModuleSetupReturn | ModuleInstance | undefined {
  const { controls } = options;
  const modules = useModuleManager();
  const instance: ModuleInstance | undefined = modules.get(name);
  return controls ? instance : instance?.exports;
}
