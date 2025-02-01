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

  await invokeNullKeyHooks(moduleInstance, hookType, suppressErrors, errors);
  await invokeDependentHooks(moduleInstance, hookType, suppressErrors, errors);

  return errors;
}

async function invokeDependentHooks(
  currentModule: ModuleInstance,
  hookType: ModuleHookType,
  suppressErrors: boolean,
  errors: Error[]
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
      suppressErrors,
      errors
    );
    await invokeSpecifiedKeyArrayHooks(
      depModule,
      currentModule,
      scope,
      hookType,
      suppressErrors,
      errors
    );
    await invokeAnyKeyHooks(
      currentModule,
      depModule,
      hookType,
      suppressErrors,
      errors
    );
    await invokeAllKeyHooks(depModule, scope, hookType, suppressErrors, errors);
  }
}
