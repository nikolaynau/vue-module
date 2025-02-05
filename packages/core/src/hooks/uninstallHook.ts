import { getModuleName, isModuleInstalled, moduleEquals } from '../module';
import { type ModuleHookType, type ModuleConfig } from '../types';
import {
  getAllModules,
  invokeAnyKeyHooks,
  invokeNullKeyHooks,
  invokeSpecKeyHooks
} from './hook';

export async function callUninstallHook(
  config: ModuleConfig<any, any>,
  suppressErrors: boolean = false,
  errors?: Error[]
): Promise<void> {
  if (isModuleInstalled(config)) {
    await invokeNullKeyHooks(config, 'uninstall', suppressErrors, errors);
    await invokeDependentHooks(config, 'uninstall', suppressErrors, errors);
  }
}

async function invokeDependentHooks(
  currentConfig: ModuleConfig,
  hookType: ModuleHookType,
  suppressErrors?: boolean,
  errors?: Error[]
) {
  const scope = currentConfig.scope;
  if (!scope) {
    return;
  }

  await invokeSpecKeyHooks(
    currentConfig,
    scope,
    hookType,
    undefined,
    suppressErrors,
    errors
  );

  await invokeAnyKeyHooks(
    currentConfig,
    currentConfig,
    hookType,
    suppressErrors,
    errors
  );

  const otherConfigs = getAllModules(scope).filter(
    c => !moduleEquals(c, currentConfig) && isModuleInstalled(c)
  );

  if (otherConfigs.length > 0) {
    const currentName = getModuleName(currentConfig);

    for (const target of otherConfigs) {
      if (currentName) {
        await invokeSpecKeyHooks(
          target,
          scope,
          hookType,
          currentName,
          suppressErrors,
          errors
        );
      }

      await invokeAnyKeyHooks(
        currentConfig,
        target,
        hookType,
        suppressErrors,
        errors
      );
    }
  }
}
