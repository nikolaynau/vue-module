import {
  defineModule,
  getModuleExports,
  type ModuleLoadConfig
} from '@vuemodule/core';

const definition = defineModule('postRouter', ({ onInstalled }) => {
  onInstalled(['app', 'router'], ([appModule, routerModule]) => {
    const app = getModuleExports(appModule)?.app;
    const router = getModuleExports(routerModule)?.router;

    if (app && router) {
      app.use(router);
    }
  });
});

export function PostRouterModule(): ModuleLoadConfig {
  return {
    loader: () => definition,
    enforce: 'post'
  };
}
