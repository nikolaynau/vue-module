import {
  defineModule,
  type ModuleKey,
  type ModuleOptions
} from '@vuemodule/core';
import {
  useSharedCounter,
  type UseSharedCounterReturn
} from './composables/useSharedCounter';

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
  () => {
    return { useSharedCounter };
  }
);
