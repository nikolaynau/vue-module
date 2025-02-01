import type {
  ModuleOptions,
  ModuleSetupReturn,
  ModuleInstance,
  ModuleConfig,
  ModuleScope,
  ModuleMeta,
  ModuleHookConfig,
  ModuleExecutionOptions
} from '../types';
import { callInstallHook, callUninstallHook } from '../hooks';
import { loadModule } from '../loader';
import { isModuleInstalled, disposeModule } from '../module';
import { handlePromises } from '../promise';

export class ModuleClass<
  T extends ModuleOptions = ModuleOptions,
  R extends ModuleSetupReturn = ModuleSetupReturn
> implements ModuleInstance<T, R>
{
  constructor(private _config: ModuleConfig<T, R>) {}

  public get config(): ModuleConfig<T, R> {
    return this._config;
  }

  public get scope(): ModuleScope | undefined {
    return this._config.scope;
  }

  public get meta(): ModuleMeta | undefined {
    return this._config.resolved?.meta;
  }

  get name(): string | undefined {
    return this._config.resolved?.meta?.name;
  }

  get version(): string | undefined {
    return this._config.resolved?.meta?.version;
  }

  public get exports(): R | undefined {
    return this._config.resolved?.exports;
  }

  public get options(): T | undefined {
    return this._config.resolved?.options;
  }

  get hooks(): ModuleHookConfig[] | undefined {
    return this._config.resolved?.hooks;
  }

  public get isInstalled(): boolean {
    return isModuleInstalled(this._config);
  }

  public async install(
    executionOptions: Omit<ModuleExecutionOptions, 'parallel'> = {}
  ): Promise<void> {
    if (!this.isInstalled) {
      const { suppressErrors = false, errors = [] } = executionOptions;
      await handlePromises(loadModule(this._config), executionOptions);
      if (!suppressErrors || (suppressErrors && errors.length === 0)) {
        await callInstallHook(this, suppressErrors, errors);
      }
    }
  }

  public async uninstall(
    executionOptions: Omit<ModuleExecutionOptions, 'parallel'> = {}
  ): Promise<void> {
    if (this.isInstalled) {
      const { suppressErrors = false, errors = [] } = executionOptions;
      await callUninstallHook(this, suppressErrors, errors);
      if (!suppressErrors || (suppressErrors && errors.length === 0)) {
        disposeModule(this._config);
      }
    }
  }
}
