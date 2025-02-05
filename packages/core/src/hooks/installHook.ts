import { getModuleName, isModuleInstalled, moduleEquals } from '../module';
import type { ModuleConfig, ModuleHookType } from '../types';
import {
  areAllModulesInstalled,
  getAllModules,
  invokeAllKeyHooks,
  invokeAllSpecKeyHooks,
  invokeAnyKeyHooks,
  invokeNullKeyHooks
} from './hook';

export async function callInstallHook(
  config: ModuleConfig<any, any>,
  suppressErrors: boolean = false,
  errors?: Error[]
): Promise<void> {
  if (isModuleInstalled(config)) {
    await invokeNullKeyHooks(config, 'installed', suppressErrors, errors);
    await invokeDependentHooks(config, 'installed', suppressErrors, errors);
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

  await invokeAllSpecKeyHooks(
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
        await invokeAllSpecKeyHooks(
          target,
          scope,
          hookType,
          currentName,
          suppressErrors,
          errors
        );
      }

      await invokeAnyKeyHooks(
        target,
        currentConfig,
        hookType,
        suppressErrors,
        errors
      );

      await invokeAnyKeyHooks(
        currentConfig,
        target,
        hookType,
        suppressErrors,
        errors
      );
    }
  }

  const allModulesInstalled = areAllModulesInstalled(scope);
  if (allModulesInstalled) {
    for (const target of getAllModules(scope)) {
      await invokeAllKeyHooks(target, scope, hookType, suppressErrors, errors);
    }
  }
}
