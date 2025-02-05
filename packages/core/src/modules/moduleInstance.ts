import type {
  ModuleOptions,
  ModuleSetupReturn,
  ModuleInstance,
  ModuleConfig,
  ModuleScope,
  ModuleMeta,
  ModuleHookConfig
} from '../types';
import { callInstallHook, callUninstallHook } from '../hooks';
import { loadModule } from '../loader';
import { isModuleInstalled, disposeModule, moduleEquals } from '../module';

export class ModuleClass<
  T extends ModuleOptions = ModuleOptions,
  R extends ModuleSetupReturn = ModuleSetupReturn
> implements ModuleInstance<T, R>
{
  public ignoreHookErrors: boolean = false;

  public hookErrors: Error[] = [];

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

  public async install(): Promise<void> {
    if (!this.isInstalled) {
      await this._handleInstall();
      await callInstallHook(this, this.ignoreHookErrors, this.hookErrors);
    }
  }

  public async uninstall(): Promise<void> {
    if (this.isInstalled) {
      await callUninstallHook(this, this.ignoreHookErrors, this.hookErrors);
      this._handleUninstall();
    }
  }

  public equals(other?: ModuleInstance<any, any>): boolean {
    return moduleEquals(this, other);
  }

  private async _handleInstall(): Promise<void> {
    await loadModule(this._config);
    if (this.scope) {
      this.scope.modules._postInstall(this);
    }
  }

  private _handleUninstall() {
    if (this.scope) {
      this.scope.modules._postUninstall(this);
    }
    disposeModule(this._config);
  }
}
