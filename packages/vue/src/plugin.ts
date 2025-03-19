import type { Plugin } from 'vue';
import {
  createModules,
  type ModuleEntry,
  type ModuleManager
} from '@vuemodule/core';
import { moduleScopeKey } from './inject';

export interface PluginOptions {
  modules?: ModuleEntry<any, any>[] | ModuleManager;
}

export const VuePlugin: Plugin<PluginOptions> = {
  install(app, options) {
    let modules: ModuleManager | undefined = Array.isArray(options.modules)
      ? createModules(options.modules)
      : options.modules;

    if (!modules) {
      modules = createModules([]);
    }

    const scope = modules.getScope();
    if (scope) {
      app.provide(moduleScopeKey, scope);
    }
  }
};
