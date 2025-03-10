export * from './types';

export { defineModule } from './define';

export { loadModule } from './loader';

export { callInstallHook, callUninstallHook } from './hooks';

export { handlePromises } from './promise';

export { newId, getVersion } from './utils';

export {
  createModule,
  createModules,
  createConfig,
  createScope
} from './modules';

export {
  isModuleInstalled,
  isModuleDisposed,
  isModuleInstance,
  isModuleConfig,
  isModuleLoader,
  getModuleName,
  getModuleVersion,
  getModuleExports,
  getModuleOptions,
  moduleEquals,
  disposeModule
} from './module';
