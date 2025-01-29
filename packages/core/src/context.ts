import type {
  InternalModuleContext,
  ModuleContext,
  ModuleHookCallback,
  ModuleHookConfig,
  ModuleHookType,
  ModuleMeta,
  ModuleOptions
} from './types';

export function createModuleContext<T extends ModuleOptions = ModuleOptions>(
  meta?: ModuleMeta,
  options?: T
): ModuleContext<T> {
  const _meta: ModuleMeta = { ...meta };
  const _options = options ?? ({} as T);
  const _hooks: ModuleHookConfig[] = [];

  function setName(name: string): void {
    _meta.name = name;
  }

  function setVersion(version: string): void {
    _meta.version = version;
  }

  function setMeta(meta: ModuleMeta) {
    Object.assign(_meta, meta);
  }

  function onInstalled(nameOrFn: unknown, fn?: unknown): void {
    onHook('installed', nameOrFn, fn);
  }

  function onUninstall(nameOrFn: unknown, fn?: unknown): void {
    onHook('uninstall', nameOrFn, fn);
  }

  function onHook(type: ModuleHookType, nameOrFn: unknown, fn?: unknown): void {
    if (typeof nameOrFn === 'function') {
      _hooks.push({
        key: null,
        type,
        callback: nameOrFn as ModuleHookCallback
      });
    } else if (
      (typeof nameOrFn === 'string' || Array.isArray(nameOrFn)) &&
      typeof fn === 'function'
    ) {
      _hooks.push({
        key: nameOrFn,
        type,
        callback: fn as ModuleHookCallback
      });
    }
  }

  const context: InternalModuleContext<T> = {
    meta: _meta,
    options: _options,
    _hooks,
    setName,
    setVersion,
    setMeta,
    onInstalled,
    onUninstall
  };

  return context;
}
