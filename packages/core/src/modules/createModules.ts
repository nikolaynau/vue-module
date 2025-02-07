import { getModuleName, moduleEquals } from '../module';
import { handlePromises } from '../promise';
import type {
  ModuleConfig,
  ModuleEnforce,
  ModuleExecutionOptions,
  ModuleInstance,
  ModuleManager,
  ModuleScope
} from '../types';
import { createScope } from './createScope';

export function createModules<T extends ModuleInstance<any, any>[]>(
  modules: T
): ModuleManager {
  let scope: ModuleScope | undefined = undefined;
  const moduleArray: ModuleInstance[] = [];

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
    const map = new Map();
    for (const module of moduleArray) {
      const name = getModuleName(module.config);
      if (name) {
        map.set(name, module);
      }
    }
    return map;
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
      return moduleArray.find(createPredicateByName(value));
    }

    if (Array.isArray(value)) {
      return moduleArray.filter(createPredicateByNames(value));
    }

    if (isModule(value)) {
      return has(value) ? value : undefined;
    }

    if (isConfig(value)) {
      return moduleArray.find(createPredicateByConfig(value));
    }

    return undefined;
  }

  function has(arg: unknown): boolean {
    if (typeof arg === 'string') {
      return moduleArray.some(createPredicateByName(arg));
    }

    if (isModule(arg)) {
      return moduleArray.some(createPredicateByModule(arg));
    }

    if (isConfig(arg)) {
      return moduleArray.some(createPredicateByConfig(arg));
    }

    return false;
  }

  function add(module: ModuleInstance<any, any>): ModuleInstance<any, any> {
    if (!has(module)) {
      module.config.scope = scope;
      moduleArray.push(module);
    }
    return module;
  }

  function remove(value: unknown): ModuleInstance<any, any> | undefined {
    const module = get(value);
    if (module) {
      const index = moduleArray.findIndex(createPredicateByModule(module));
      if (index !== -1) {
        moduleArray.splice(index, 1);
      }
    }
    return module;
  }

  function removeAll(): void {
    moduleArray.length = 0;
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
      await executeModulesInOrder(module => module.install(), args[0], args[1]);
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
      await executeModulesInOrder(
        module => module.uninstall(),
        args[0],
        executionOptions
      );
    }
  }

  function initialize(moduleScope: ModuleScope) {
    scope = moduleScope;
    if (Array.isArray(modules)) {
      for (const module of modules) {
        module.config.scope = scope;
        moduleArray.push(module);
      }
    }
  }

  async function executeModulesInOrder(
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

  function isModule(value: any): value is ModuleInstance {
    return typeof value === 'object' && value !== null && 'config' in value;
  }

  function isConfig(value: any): value is ModuleConfig {
    return typeof value === 'object' && value !== null && 'loader' in value;
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

  function createPredicateByName(
    value: string
  ): (module: ModuleInstance) => boolean {
    return (module: ModuleInstance) => getModuleName(module.config) === value;
  }

  function createPredicateByNames(
    value: string[]
  ): (module: ModuleInstance) => boolean {
    const valueSet = new Set(value);
    return (module: ModuleInstance) =>
      valueSet.has(getModuleName(module.config)!);
  }

  function createPredicateByInstalled(): (module: ModuleInstance) => boolean {
    return (module: ModuleInstance) => module.isInstalled();
  }

  const manager: ModuleManager = {
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
    uninstall
  };

  initialize(createScope(manager));
  return manager;
}
