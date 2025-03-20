import type { App } from 'vue';
import {
  defineModule,
  type ModuleKey,
  type ModuleLoadConfig
} from '@vuemodule/core';

export interface AppModuleOptions {
  app: App;
}

export interface AppModuleReturn {
  app: App;
}

declare module '@vuemodule/core' {
  interface ModuleMap {
    app: AppModuleReturn;
  }
}

const definition = defineModule<AppModuleOptions, AppModuleReturn, ModuleKey>(
  'app',
  ({ options }) => {
    const { app } = options;
    return { app };
  }
);

export function AppModule(
  app: App
): ModuleLoadConfig<AppModuleOptions, AppModuleReturn> {
  return {
    loader: () => definition,
    options: { app },
    enforce: 'pre'
  };
}
