import { ref, type Ref } from 'vue';
import {
  defineModule,
  getModuleExports,
  type ModuleKey,
  type ModuleOptions
} from '@vuemodule/core';
import type { RouteLocationRaw } from 'vue-router';

const IndexPage = () => import('./pages/IndexPage.vue');

export interface NavItem {
  title: string;
  route: RouteLocationRaw;
}

export interface IdxModuleReturn {
  nav: Ref<NavItem[]>;
}

declare module '@vuemodule/core' {
  interface ModuleMap {
    idx: IdxModuleReturn;
  }
}

export default defineModule<ModuleOptions, IdxModuleReturn, ModuleKey>(
  'idx',
  ({ onInstalled }) => {
    const nav = ref<NavItem[]>([]);

    onInstalled('router', routerModule => {
      const { router } = getModuleExports(routerModule)!;
      router.addRoute({
        path: '/',
        name: 'root',
        component: IndexPage
      });
    });

    return { nav };
  }
);
