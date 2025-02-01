import {
  ModuleHookKey,
  type ModuleHookConfig,
  type ModuleHookType,
  type ModuleInstance,
  type ModuleScope
} from '../types';

export async function invokeNullKeyHooks(
  moduleInstance: ModuleInstance,
  hookType: ModuleHookType,
  suppressErrors?: boolean,
  errors?: Error[]
) {
  const hooksToCall = moduleInstance.hooks?.filter(
    hook => hook.type === hookType && hook.key === null
  );

  if (hooksToCall && hooksToCall.length > 0) {
    await invokeHooks(hooksToCall, moduleInstance, suppressErrors, errors);
  }
}

export async function invokeAllKeyHooks(
  moduleInstance: ModuleInstance,
  scope: ModuleScope,
  hookType: ModuleHookType,
  suppressErrors?: boolean,
  errors?: Error[]
) {
  const hooksToCall = moduleInstance.hooks?.filter(
    hook => hook.type === hookType && hook.key === ModuleHookKey.All
  );

  if (hooksToCall && hooksToCall.length > 0) {
    const allModulesInstalled = areAllModulesInstalled(scope);

    if (allModulesInstalled) {
      const configs = getAllModules(scope);
      await invokeHooks(hooksToCall, configs, suppressErrors, errors);
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
    await invokeHooks(hooksToCall, source, suppressErrors, errors);
  }
}

export async function invokeSpecifiedKeyHooks(
  source: ModuleInstance,
  target: ModuleInstance,
  hookType: ModuleHookType,
  suppressErrors?: boolean,
  errors?: Error[]
) {
  if (!source.name) {
    return;
  }

  const hooksToCall = target.hooks?.filter(
    hook => hook.type === hookType && hook.key === source.name
  );

  if (hooksToCall && hooksToCall.length > 0) {
    await invokeHooks(hooksToCall, source, suppressErrors, errors);
  }
}

export async function invokeSpecifiedKeyArrayHooks(
  source: ModuleInstance,
  target: ModuleInstance,
  scope: ModuleScope,
  hookType: ModuleHookType,
  suppressErrors?: boolean,
  errors?: Error[]
) {
  if (!source.name) {
    return;
  }

  const hooksToCall = target.hooks?.filter(
    hook =>
      hook.type === hookType &&
      Array.isArray(hook.key) &&
      hook.key.includes(source.name!)
  );

  if (hooksToCall && hooksToCall.length > 0) {
    for (const hook of hooksToCall) {
      const keys = hook.key as string[];

      const modules = keys
        .map(key => scope.modules.get(key))
        .filter(m => m?.isInstalled) as ModuleInstance[];

      if (modules.length === keys.length) {
        await invokeHook(hook, modules, suppressErrors, errors);
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
  hook.lock = true;
  try {
    await hook.callback(moduleInstance);
    hook.lock = false;

    if (hook.key !== 'any') {
      hook.called = true;
    }
  } catch (e) {
    hook.lock = false;
    if (suppressErrors) {
      errors?.push(e as Error);
    } else {
      throw e;
    }
  }
}

export async function invokeHooks(
  hooks: ModuleHookConfig[],
  moduleInstance: ModuleInstance | ModuleInstance[],
  suppressErrors?: boolean,
  errors?: Error[]
) {
  for (const hook of hooks) {
    if (canInvokeHook(hook)) {
      await invokeHook(hook, moduleInstance, suppressErrors, errors);
    }
  }
}

export function canInvokeHook(hook: ModuleHookConfig): boolean {
  return !hook.lock && !hook.called;
}

export function areAllModulesInstalled(scope: ModuleScope): boolean {
  return scope.modules.isInstalled();
}

export function getAllModules(scope: ModuleScope): ModuleInstance<any, any>[] {
  return scope.modules.toArray();
}
