import {
  defineModule,
  getModuleExports,
  type ModuleKey,
  type ModuleOptions
} from '@vuemodule/core';
import {
  useSharedCounter,
  type UseSharedCounterReturn
} from './composables/useSharedCounter';

const CounterPage = () => import('./pages/CounterPage.vue');

export interface CounterModuleReturn {
  useSharedCounter: () => UseSharedCounterReturn;
}

declare module '@vuemodule/core' {
  interface ModuleMap {
    counter: CounterModuleReturn;
  }
}

export default defineModule<ModuleOptions, CounterModuleReturn, ModuleKey>(
  'counter',
  ({ onInstalled }) => {
    onInstalled(['layout', 'idx'], ([layoutModule, idxModule]) => {
      const { routes } = getModuleExports(layoutModule)!;
      const { nav } = getModuleExports(idxModule)!;

      routes.value.push({
        path: 'counter',
        name: 'counter',
        component: CounterPage
      });

      nav.value.push({
        title: 'Counter Demo',
        route: { name: 'counter' }
      });
    });

    return { useSharedCounter };
  }
);
