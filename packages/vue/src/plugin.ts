import type { Plugin } from 'vue';
import {
  createModules,
  type ModuleEntry,
  type ModuleManager
} from '@vuemodule/core';
import { provideModuleScope } from './inject';

export interface PluginOptions {
  modules?: ModuleEntry<any, any>[] | ModuleManager;
}

export const VuePlugin: Plugin<PluginOptions> = {
  install(app, options) {
    let modules: ModuleManager | undefined = undefined;

    if (Array.isArray(options.modules)) {
      modules = createModules(options.modules);
    } else if (options.modules) {
      modules = options.modules;
    }

    const scope = modules?.getScope();
    if (scope) {
      provideModuleScope(scope);
    }
  }
};
