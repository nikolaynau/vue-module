import type {
  InternalModuleContext,
  ModuleContext,
  ModuleHookCallback,
  ModuleHookConfig,
  ModuleHookType,
  ModuleInstance,
  ModuleMeta,
  ModuleOptions,
  ModuleScope
} from './types';
import { isModuleInstance } from './module';
import { createModule } from './modules';

export function createModuleContext<T extends ModuleOptions = ModuleOptions>(
  meta?: ModuleMeta,
  options?: T,
  scope?: ModuleScope
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

  function getModule(name: string): ModuleInstance | undefined {
    return scope?.modules?.get(name);
  }

  function getScope(): ModuleScope | undefined {
    return scope;
  }

  async function installModule(...args: unknown[]): Promise<ModuleInstance> {
    const module = isModuleInstance(args[0])
      ? args[0]
      : ((createModule as any)(...args) as ModuleInstance);
    if (scope) {
      await scope.modules.install(module);
    } else {
      await module.install();
    }
    return module;
  }

  function onInstalled(nameOrFn: unknown, fn?: unknown): void {
    onHook('installed', nameOrFn, fn);
  }

  function onUninstall(nameOrFn: unknown, fn?: unknown): void {
    onHook('uninstall', nameOrFn, fn);
  }

  function onHook(type: ModuleHookType, nameOrFn: unknown, fn?: unknown): void {
    if (typeof nameOrFn === 'function') {
      _hooks.push(createHookConfig(null, type, nameOrFn as ModuleHookCallback));
    } else if (
      (typeof nameOrFn === 'string' || Array.isArray(nameOrFn)) &&
      typeof fn === 'function'
    ) {
      _hooks.push(createHookConfig(nameOrFn, type, fn as ModuleHookCallback));
    }
  }

  function createHookConfig(
    key: ModuleHookConfig['key'],
    type: ModuleHookType,
    callback: ModuleHookConfig['callback']
  ): ModuleHookConfig {
    return {
      key,
      type,
      callback
    };
  }

  const context: InternalModuleContext<T> = {
    meta: _meta,
    options: _options,
    _hooks,
    setName,
    setVersion,
    setMeta,
    getModule,
    getScope,
    installModule,
    onInstalled,
    onUninstall
  };

  return context;
}
