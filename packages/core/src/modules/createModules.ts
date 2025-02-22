import type {
  Arrayable,
  InternalModuleManager,
  ModuleConfig,
  ModuleDep,
  ModuleEnforce,
  ModuleExecutionOptions,
  ModuleInstance,
  ModuleLoadConfig,
  ModuleLoader,
  ModuleManager,
  ModuleOptions,
  ModuleScope
} from '../types';
import {
  getModuleName,
  isModuleConfig,
  isModuleInstance,
  moduleEquals
} from '../module';
import { handlePromises } from '../promise';
import { createScope } from './createScope';
import { isObject } from '../utils';
import { createModule } from './createModule';

export type ModuleEntry =
  | ModuleLoader<any, any>
  | ModuleLoadConfig<any, any>
  | [ModuleLoader<any, any>, ModuleOptions]
  | [ModuleLoader<any, any>, ...ModuleDep[]]
  | ModuleInstance<any, any>;

export function createModules<T extends ModuleEntry[]>(
  modules: T
): ModuleManager {
  let scope: ModuleScope | undefined = undefined;
  const moduleArray: ModuleInstance[] = [];
  const moduleMap: Map<string, ModuleInstance> = new Map();

  function getScope(): ModuleScope {
    return scope!;
  }

  function getSize(): number {
    return moduleArray.length;
  }

  function isEmpty(): boolean {
    return moduleArray.length === 0;
  }

  function toArray(): ModuleInstance[] {
    return [...moduleArray];
  }

  function toMap(): Map<string, ModuleInstance> {
    return new Map(moduleMap);
  }

  function getAt(index: number): ModuleInstance | undefined {
    return moduleArray[index];
  }

  function get(value: unknown[]): ModuleInstance<any, any>[];
  function get(value: unknown): ModuleInstance<any, any> | undefined;
  function get(
    value: unknown
  ): ModuleInstance<any, any> | ModuleInstance<any, any>[] | undefined {
    if (typeof value === 'string') {
      return fromMap(value);
    }

    if (Array.isArray(value)) {
      return fromMap(value);
    }

    if (isModuleInstance(value)) {
      return has(value) ? value : undefined;
    }

    if (isModuleConfig(value)) {
      return getModuleName(value)
        ? fromMap(getModuleName(value))
        : moduleArray.find(createPredicateByConfig(value));
    }

    return undefined;
  }

  function has(value: unknown): boolean {
    if (typeof value === 'string') {
      return moduleMap.has(value);
    }

    if (isModuleInstance(value)) {
      return getModuleName(value.config)
        ? moduleMap.has(getModuleName(value.config)!)
        : moduleArray.some(createPredicateByModule(value));
    }

    if (isModuleConfig(value)) {
      return getModuleName(value)
        ? moduleMap.has(getModuleName(value)!)
        : moduleArray.some(createPredicateByConfig(value));
    }

    return false;
  }

  function add(module: ModuleInstance<any, any>): ModuleInstance<any, any> {
    if (!has(module)) {
      module.setScope(scope);
      moduleArray.push(module);
      addToMap(module);
    }
    return module;
  }

  function remove(value: unknown): ModuleInstance<any, any> | undefined {
    const module = get(value);
    if (module) {
      const index = moduleArray.findIndex(createPredicateByModule(module));
      if (index !== -1) {
        moduleArray.splice(index, 1);
        removeFromMap(module);
      }
    }
    return module;
  }

  function removeAll(): void {
    moduleArray.length = 0;
    moduleMap.clear();
  }

  function isInstalled(value?: unknown): boolean {
    return value
      ? Boolean(get(value)?.isInstalled())
      : moduleArray.every(createPredicateByInstalled());
  }

  async function install(...args: any[]): Promise<void> {
    if (args.length === 1 && args[0] && typeof args[0] !== 'function') {
      await add(args[0]).install();
    } else {
      await executeInOrder(module => module.install(), args[0], args[1]);
    }
  }

  async function uninstall(...args: any[]): Promise<void> {
    if (args.length === 1 && args[0] && typeof args[0] !== 'function') {
      const module = get(args[0]);
      if (module) {
        await module.uninstall();
      }
    } else {
      const executionOptions = {
        ...args[1],
        parallel: false
      } satisfies ModuleExecutionOptions;
      await executeInOrder(
        module => module.uninstall(),
        args[0],
        executionOptions
      );
    }
  }

  function initialize(moduleScope: ModuleScope) {
    scope = moduleScope;
    if (Array.isArray(modules)) {
      for (const moduleArgs of modules) {
        let module: ModuleInstance;

        if (Array.isArray(moduleArgs)) {
          module = (createModule as any)(...moduleArgs);
        } else if (isObject(moduleArgs) && isModuleInstance(moduleArgs)) {
          module = moduleArgs;
        } else {
          module = (createModule as any)(moduleArgs);
        }

        module.setScope(scope);
        moduleArray.push(module);
        addToMap(module);
      }
    }
  }

  function fromMap(value?: string): ModuleInstance<any, any> | undefined;
  function fromMap(value?: string[]): ModuleInstance<any, any>[];
  function fromMap(
    value?: string | string[]
  ): Arrayable<ModuleInstance<any, any>> | undefined {
    if (!Array.isArray(value)) {
      return typeof value === 'string' && value
        ? moduleMap.get(value)
        : undefined;
    }

    const result: ModuleInstance<any, any>[] = [];
    for (const val of value) {
      if (typeof val === 'string' && val) {
        const module = moduleMap.get(val);
        if (module) {
          result.push(module);
        }
      }
    }
    return result;
  }

  function addToMap(module: ModuleInstance): void {
    const name = getModuleName(module.config);
    if (name) {
      moduleMap.set(name, module);
    }
  }

  function removeFromMap(module: ModuleInstance): void {
    const name = getModuleName(module.config);
    if (name) {
      moduleMap.delete(name);
    }
  }

  function _postInstall(module: ModuleInstance<any, any>): void {
    addToMap(module);
  }

  function _preDispose(module: ModuleInstance<any, any>): void {
    removeFromMap(module);
  }

  async function executeInOrder(
    fn: (module: ModuleInstance) => Promise<void>,
    filter?: (module: ModuleInstance) => boolean,
    options?: ModuleExecutionOptions
  ) {
    const moduleGroups: Record<ModuleEnforce | 'default', ModuleInstance[]> = {
      pre: [],
      post: [],
      fin: [],
      default: []
    };

    for (const module of moduleArray) {
      if (filter && !filter(module)) {
        continue;
      }

      const groupKey = (module.config.enforce as ModuleEnforce) ?? 'default';
      moduleGroups[groupKey].push(module);
    }

    const sequentialExecutionOptions: ModuleExecutionOptions = Object.assign(
      {},
      options,
      { parallel: false } satisfies ModuleExecutionOptions
    );

    for (const moduleGroup of [
      [moduleGroups.pre, sequentialExecutionOptions],
      [moduleGroups.default, options],
      [moduleGroups.post, sequentialExecutionOptions],
      [moduleGroups.fin, sequentialExecutionOptions]
    ] satisfies [ModuleInstance[], ModuleExecutionOptions | undefined][]) {
      const [modules, executionOptions] = moduleGroup;

      if (modules.length > 0) {
        await handlePromises(
          modules.map(m => () => fn(m)),
          executionOptions
        );
      }
    }
  }

  function createPredicateByConfig(
    value: ModuleConfig
  ): (module: ModuleInstance) => boolean {
    return (module: ModuleInstance) => moduleEquals(value, module.config);
  }

  function createPredicateByModule(
    value: ModuleInstance
  ): (module: ModuleInstance) => boolean {
    return (module: ModuleInstance) => module.equals(value);
  }

  function createPredicateByInstalled(): (module: ModuleInstance) => boolean {
    return (module: ModuleInstance) => module.isInstalled();
  }

  const manager: InternalModuleManager = {
    getScope,
    getSize,
    isEmpty,
    toArray,
    toMap,
    getAt,
    has,
    get,
    add,
    remove,
    removeAll,
    isInstalled,
    install,
    uninstall,
    _postInstall,
    _preDispose
  };

  initialize(createScope(manager));
  return manager;
}
