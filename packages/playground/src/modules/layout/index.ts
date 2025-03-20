import { ref, toRaw, watch, type Ref } from 'vue';
import type { RouteRecordRaw } from 'vue-router';
import {
  defineModule,
  getModuleExports,
  type ModuleKey,
  type ModuleOptions
} from '@vuemodule/core';

const DefaultLayout = () => import('./components/DefaultLayout.vue');

export interface LayoutModuleReturn {
  routes: Ref<RouteRecordRaw[]>;
}

declare module '@vuemodule/core' {
  interface ModuleMap {
    layout: LayoutModuleReturn;
  }
}

export default defineModule<ModuleOptions, LayoutModuleReturn, ModuleKey>(
  'layout',
  ({ onInstalled }) => {
    const routes = ref<RouteRecordRaw[]>([]);

    onInstalled('router', routerModule => {
      const { router } = getModuleExports(routerModule)!;
      router.addRoute(buildRoutes());

      watch(
        routes,
        () => {
          router.removeRoute('root');
          router.addRoute(buildRoutes());
        },
        { deep: true }
      );
    });

    function buildRoutes(): RouteRecordRaw {
      return {
        path: '/',
        name: 'root',
        component: DefaultLayout,
        children: [...toRaw(routes.value)]
      };
    }

    return { routes };
  }
);
