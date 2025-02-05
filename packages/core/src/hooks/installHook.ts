import type { ModuleHookType, ModuleInstance } from '../types';
import {
  areAllModulesInstalled,
  getAllModules,
  invokeAllKeyHooks,
  invokeAllSpecifiedKeyHooks,
  invokeAnyKeyHooks,
  invokeNullKeyHooks
} from './hook';

export async function callInstallHook(
  moduleInstance: ModuleInstance<any, any>,
  suppressErrors: boolean = false,
  errors?: Error[]
): Promise<void> {
  if (!moduleInstance.isInstalled) {
    return;
  }

  const hookType: ModuleHookType = 'installed';

  await invokeNullKeyHooks(moduleInstance, hookType, suppressErrors, errors);
  await invokeDependentHooks(moduleInstance, hookType, suppressErrors, errors);
}

async function invokeDependentHooks(
  currentModule: ModuleInstance,
  hookType: ModuleHookType,
  suppressErrors?: boolean,
  errors?: Error[]
) {
  const scope = currentModule.scope;
  if (!scope) {
    return;
  }

  await invokeAllSpecifiedKeyHooks(
    currentModule,
    scope,
    hookType,
    undefined,
    suppressErrors,
    errors
  );

  await invokeAnyKeyHooks(
    currentModule,
    currentModule,
    hookType,
    suppressErrors,
    errors
  );

  const otherModules = getAllModules(scope).filter(
    m => !currentModule.equals(m) && m.isInstalled
  );

  if (otherModules.length > 0) {
    for (const targetModule of otherModules) {
      if (currentModule.name) {
        await invokeAllSpecifiedKeyHooks(
          targetModule,
          scope,
          hookType,
          currentModule.name,
          suppressErrors,
          errors
        );
      }

      await invokeAnyKeyHooks(
        targetModule,
        currentModule,
        hookType,
        suppressErrors,
        errors
      );

      await invokeAnyKeyHooks(
        currentModule,
        targetModule,
        hookType,
        suppressErrors,
        errors
      );
    }
  }

  const allModulesInstalled = areAllModulesInstalled(scope);
  if (allModulesInstalled) {
    for (const targetModule of getAllModules(scope)) {
      await invokeAllKeyHooks(
        targetModule,
        scope,
        hookType,
        suppressErrors,
        errors
      );
    }
  }
}
