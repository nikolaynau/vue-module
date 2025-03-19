import { ref, type Ref } from 'vue';
import {
  defineModule,
  type ModuleKey,
  type ModuleOptions
} from '@vuemodule/core';

export interface IdxModuleReturn {
  nav: Ref<string[]>;
}

declare module '@vuemodule/core' {
  interface ModuleMap {
    idx: IdxModuleReturn;
  }
}

export default defineModule<ModuleOptions, IdxModuleReturn, ModuleKey>(
  'idx',
  () => {
    const nav = ref<string[]>([]);
    return { nav };
  }
);
