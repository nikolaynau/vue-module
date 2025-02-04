import { moduleEquals } from '../module';
import { type ModuleHookType, type ModuleInstance } from '../types';
import {
  getAllModules,
  invokeAnyKeyHooks,
  invokeNullKeyHooks,
  invokeSpecifiedKeyHooks
} from './hook';

export async function callUninstallHook(
  moduleInstance: ModuleInstance<any, any>,
  suppressErrors: boolean = false,
  errors?: Error[]
): Promise<void> {
  if (!moduleInstance.isInstalled) {
    return;
  }

  const hookType: ModuleHookType = 'uninstall';

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

  for (const depModule of getAllModules(scope)) {
    const isCurrentModule = moduleEquals(currentModule, depModule);

    if (isCurrentModule) {
      await invokeSpecifiedKeyHooks(
        depModule,
        scope,
        hookType,
        undefined,
        suppressErrors,
        errors
      );
    } else if (currentModule.name) {
      await invokeSpecifiedKeyHooks(
        depModule,
        scope,
        hookType,
        currentModule.name,
        suppressErrors,
        errors
      );
    }

    await invokeAnyKeyHooks(
      currentModule,
      depModule,
      hookType,
      suppressErrors,
      errors
    );
  }
}
