import { VuePlugin, type PluginOptions } from './plugin';

export { useModuleScope } from './inject';

export {
  useModule,
  useModuleManager,
  useLoadModules,
  useLoadModule
} from './composables';

export { VuePlugin as VueModule, type PluginOptions };
