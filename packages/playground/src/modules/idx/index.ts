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

    onInstalled('layout', layoutModule => {
      const { routes } = getModuleExports(layoutModule)!;
      routes.value.push({
        path: '',
        name: 'home',
        component: IndexPage
      });
    });

    return { nav };
  }
);
