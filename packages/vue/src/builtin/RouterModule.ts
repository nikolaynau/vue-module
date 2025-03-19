import type { Router } from 'vue-router';
import {
  defineModule,
  type ModuleKey,
  type ModuleLoadConfig
} from '@vuemodule/core';

export interface RouterModuleOptions {
  router: Router;
}

export interface RouterModuleReturn {
  router: Router;
}

declare module '@vuemodule/core' {
  interface ModuleMap {
    router: RouterModuleReturn;
  }
}

const definition = defineModule<
  RouterModuleOptions,
  RouterModuleReturn,
  ModuleKey
>('router', ({ options }) => {
  const { router } = options;
  return { router };
});

export function RouterModule(
  router: Router
): ModuleLoadConfig<RouterModuleOptions, RouterModuleReturn> {
  return {
    loader: () => definition,
    options: { router },
    enforce: 'pre'
  };
}
