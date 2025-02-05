import type {
  ModuleConfig,
  ModuleExecutionOptions,
  ModuleInstance,
  ModuleManager,
  ModuleEnforce,
  ModuleScope
} from '../types';
import { handlePromises } from '../promise';

export class ModuleManagerClass implements ModuleManager {
  private _modules: ModuleInstance[] = [];
  private _moduleMap: Map<string, ModuleInstance> = new Map();
  private _scope: ModuleScope | undefined;

  constructor(modules: ModuleInstance<any, any>[]) {
    this._initialize(modules);
  }

  public get size(): number {
    return this._modules.length;
  }

  public get isEmpty(): boolean {
    return this.size === 0;
  }

  public setScope(scope: ModuleScope): void {
    this._scope = scope;

    for (const _module of this._modules) {
      _module.config.scope = scope;
    }
  }

  public getScope(): ModuleScope | undefined {
    return this._scope;
  }

  public toArray(): ModuleInstance[] {
    return [...this._modules];
  }

  public toMap(): Map<string, ModuleInstance> {
    return new Map(this._moduleMap);
  }

  public get(value: unknown): ModuleInstance<any, any> | undefined {
    if (typeof value === 'string') {
      return this._moduleMap.get(value as string);
    }
    if (this._isInstance(value)) {
      return this.has(value) ? value : undefined;
    }
    return this._getForConfig(value as ModuleConfig);
  }

  public getAt(index: number): ModuleInstance | undefined {
    return this._modules[index];
  }

  public has(arg: unknown): boolean {
    if (typeof arg === 'string') {
      return this._moduleMap.has(arg);
    }
    if (this._isInstance(arg)) {
      return this._modules.findIndex(item => item.equals(arg)) !== -1;
    }
    return Boolean(this._getForConfig(arg as ModuleConfig));
  }

  public add(instance: ModuleInstance<any, any>): ModuleInstance<any, any> {
    if (!this.get(instance.config)) {
      instance.config.scope = this._scope;
      this._addModule(instance);
    }
    return instance;
  }

  public remove(value: unknown): ModuleInstance<any, any> | undefined {
    const instance = this.get(value);
    if (instance) {
      this._removeModule(instance);
    }
    return instance;
  }

  public removeAll(): void {
    this._moduleMap.clear();
    this._modules.length = 0;
  }

  public isInstalled(value?: unknown): boolean {
    return value
      ? Boolean(this.get(value)?.isInstalled)
      : this._modules.every(m => m.isInstalled);
  }

  public async install(...args: any[]): Promise<void> {
    if (args.length === 1 && args[0] && typeof args[0] !== 'function') {
      await this.add(args[0]).install();
    } else {
      await this._executeModulesInOrder(
        instance => instance.install(),
        args[0],
        args[1]
      );
    }
  }

  public async uninstall(...args: any[]): Promise<void> {
    if (args.length === 1 && args[0] && typeof args[0] !== 'function') {
      const instance = this.get(args[0]);
      if (instance) {
        await instance.uninstall();
      }
    } else {
      const executionOptions = {
        ...args[1],
        parallel: false
      } satisfies ModuleExecutionOptions;
      await this._executeModulesInOrder(
        instance => instance.uninstall(),
        args[0],
        executionOptions
      );
    }
  }

  public _postInstall(instance: ModuleInstance<any, any>): void {
    if (instance.name) {
      this._moduleMap.set(instance.name, instance);
    }
  }

  public _postUninstall(instance: ModuleInstance<any, any>): void {
    const name = instance.name;
    if (name) {
      this._moduleMap.delete(name);
    }
  }

  private _initialize(modules: ModuleInstance[]): void {
    this._modules.push(...modules);
    for (const _module of this._modules) {
      if (_module.name) {
        this._moduleMap.set(_module.name, _module);
      }
    }
  }

  private _addModule(instance: ModuleInstance<any, any>): void {
    if (instance.name) {
      this._moduleMap.set(instance.name, instance);
    }
    this._modules.push(instance);
  }

  private _removeModule(instance: ModuleInstance): void {
    if (instance.name) {
      this._moduleMap.delete(instance.name);
    }
    this._removeFromArray(item => item.equals(instance));
  }

  private _removeFromArray(
    predicate: (instance: ModuleInstance) => boolean
  ): void {
    const index = this._modules.findIndex(predicate);
    if (index !== -1) {
      this._modules.splice(index, 1);
    }
  }

  private _isInstance(value: any): value is ModuleInstance {
    return typeof value === 'object' && value !== null && 'config' in value;
  }

  private _getForConfig(config?: ModuleConfig): ModuleInstance | undefined {
    const predicate: (
      item: ModuleInstance<any, any>
    ) => boolean | undefined = item =>
      config &&
      (item.config === config ||
        (item.config.id && config.id && item.config.id === config.id));

    return config?.resolved?.meta?.name
      ? this._moduleMap.get(config.resolved.meta.name)
      : this._modules.find(predicate);
  }

  private async _executeModulesInOrder(
    fn: (instance: ModuleInstance) => Promise<void>,
    filter?: (instance: ModuleInstance) => boolean,
    options?: ModuleExecutionOptions
  ) {
    const moduleGroups: Record<ModuleEnforce | 'default', ModuleInstance[]> = {
      pre: [],
      post: [],
      fin: [],
      default: []
    };

    for (const _module of this._modules) {
      if (filter && !filter(_module)) {
        continue;
      }

      const groupKey = (_module.config.enforce as ModuleEnforce) ?? 'default';
      moduleGroups[groupKey].push(_module);
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
}
