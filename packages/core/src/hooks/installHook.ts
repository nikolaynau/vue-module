import { type ModuleHookType, type ModuleInstance } from '../types';
import {
  getAllModules,
  invokeAllKeyHooks,
  invokeAnyKeyHooks,
  invokeNullKeyHooks,
  invokeSpecifiedKeyArrayHooks,
  invokeSpecifiedKeyHooks
} from './hook';

export async function callInstallHook(
  moduleInstance: ModuleInstance<any, any>,
  suppressErrors: boolean = false
): Promise<Error[]> {
  if (!moduleInstance.isInstalled) {
    return [];
  }

  const errors: Error[] = [];
  const hookType: ModuleHookType = 'installed';

  await invokeNullKeyHooks(moduleInstance, hookType, errors, suppressErrors);
  await invokeDependentHooks(moduleInstance, hookType, errors, suppressErrors);

  return errors;
}

async function invokeDependentHooks(
  currentModule: ModuleInstance,
  hookType: ModuleHookType,
  errors: Error[],
  suppressErrors: boolean
) {
  const scope = currentModule.scope;
  if (!scope) {
    return;
  }

  for (const depModule of getAllModules(scope)) {
    await invokeSpecifiedKeyHooks(
      depModule,
      currentModule,
      hookType,
      errors,
      suppressErrors
    );
    await invokeSpecifiedKeyArrayHooks(
      depModule,
      currentModule,
      scope,
      hookType,
      errors,
      suppressErrors
    );
    await invokeAnyKeyHooks(
      depModule,
      currentModule,
      hookType,
      errors,
      suppressErrors
    );
    await invokeAllKeyHooks(depModule, scope, hookType, errors, suppressErrors);
  }
}
