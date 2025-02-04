import {
  ModuleHookKey,
  type ModuleHookConfig,
  type ModuleHookType,
  type ModuleInstance,
  type ModuleScope
} from '../types';

export async function invokeNullKeyHooks(
  target: ModuleInstance,
  hookType: ModuleHookType,
  suppressErrors?: boolean,
  errors?: Error[]
) {
  const hooksToCall = target.hooks?.filter(
    hook => hook.type === hookType && hook.key === null && !hook.called
  );

  if (hooksToCall && hooksToCall.length > 0) {
    for (const hook of hooksToCall) {
      await invokeHook(hook, target, suppressErrors, errors);
    }
  }
}

export async function invokeAllKeyHooks(
  target: ModuleInstance,
  scope: ModuleScope,
  hookType: ModuleHookType,
  suppressErrors?: boolean,
  errors?: Error[]
) {
  const hooksToCall = target.hooks?.filter(
    hook =>
      hook.type === hookType && hook.key === ModuleHookKey.All && !hook.called
  );

  if (hooksToCall && hooksToCall.length > 0) {
    const allModulesInstalled = areAllModulesInstalled(scope);

    if (allModulesInstalled) {
      const configs = getAllModules(scope);

      for (const hook of hooksToCall) {
        await invokeHook(hook, configs, suppressErrors, errors);
      }
    }
  }
}

export async function invokeAnyKeyHooks(
  source: ModuleInstance,
  target: ModuleInstance,
  hookType: ModuleHookType,
  suppressErrors?: boolean,
  errors?: Error[]
) {
  const hooksToCall = target.hooks?.filter(
    hook => hook.type === hookType && hook.key === ModuleHookKey.Any
  );

  if (hooksToCall && hooksToCall.length > 0) {
    for (const hook of hooksToCall) {
      await invokeHook(hook, source, suppressErrors, errors);
    }
  }
}

export async function invokeSpecifiedKeyHooks(
  target: ModuleInstance,
  scope: ModuleScope,
  hookType: ModuleHookType,
  suppressErrors?: boolean,
  errors?: Error[]
) {
  const hooksToCall = target.hooks?.filter(
    hook =>
      hook.type === hookType && typeof hook.key === 'string' && !hook.called
  );

  if (hooksToCall && hooksToCall.length > 0) {
    for (const hook of hooksToCall) {
      const depModule = scope.modules.get(hook.key as string);

      if (depModule?.isInstalled) {
        await invokeHook(hook, depModule, suppressErrors, errors);
      }
    }
  }
}

export async function invokeSpecifiedKeyArrayHooks(
  target: ModuleInstance,
  scope: ModuleScope,
  hookType: ModuleHookType,
  suppressErrors?: boolean,
  errors?: Error[]
) {
  const hooksToCall = target.hooks?.filter(
    hook => hook.type === hookType && Array.isArray(hook.key) && !hook.called
  );

  if (hooksToCall && hooksToCall.length > 0) {
    for (const hook of hooksToCall) {
      const keys = hook.key as string[];

      const depModules = keys
        .map(key => scope.modules.get(key))
        .filter(m => m?.isInstalled) as ModuleInstance[];

      if (depModules.length === keys.length) {
        await invokeHook(hook, depModules, suppressErrors, errors);
      }
    }
  }
}

export async function invokeHook(
  hook: ModuleHookConfig,
  moduleInstance: ModuleInstance | ModuleInstance[],
  suppressErrors?: boolean,
  errors?: Error[]
) {
  const canLock = hook.key !== ModuleHookKey.Any;
  if (canLock && (hook.lock || hook.called)) {
    return;
  }

  hook.lock = canLock;
  try {
    await hook.callback(moduleInstance);
    hook.lock = false;
    hook.called = canLock;
  } catch (e) {
    hook.lock = false;
    if (suppressErrors) {
      errors?.push(e as Error);
    } else {
      throw e;
    }
  }
}

export function areAllModulesInstalled(scope: ModuleScope): boolean {
  return scope.modules.isInstalled();
}

export function getAllModules(scope: ModuleScope): ModuleInstance<any, any>[] {
  return scope.modules.toArray();
}
