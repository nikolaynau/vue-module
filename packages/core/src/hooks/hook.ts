import {
  ModuleHookKey,
  type ModuleHookConfig,
  type ModuleHookType,
  type ModuleConfig,
  type ModuleScope
} from '../types';

export async function invokeNullKeyHooks(
  target: ModuleConfig,
  hookType: ModuleHookType,
  suppressErrors?: boolean,
  errors?: Error[]
) {
  const hooksToCall = target.resolved?.hooks?.filter(
    hook => hook.type === hookType && hook.key === null && !hook.called
  );

  if (hooksToCall && hooksToCall.length > 0) {
    for (const hook of hooksToCall) {
      await invokeHook(hook, target, suppressErrors, errors);
    }
  }
}

export async function invokeAllKeyHooks(
  target: ModuleConfig,
  scope: ModuleScope,
  hookType: ModuleHookType,
  suppressErrors?: boolean,
  errors?: Error[]
) {
  const hooksToCall = target.resolved?.hooks?.filter(
    hook =>
      hook.type === hookType && hook.key === ModuleHookKey.All && !hook.called
  );

  if (hooksToCall && hooksToCall.length > 0) {
    const modules = getAllModules(scope);

    for (const hook of hooksToCall) {
      await invokeHook(hook, modules, suppressErrors, errors);
    }
  }
}

export async function invokeAnyKeyHooks(
  source: ModuleConfig,
  target: ModuleConfig,
  hookType: ModuleHookType,
  suppressErrors?: boolean,
  errors?: Error[]
) {
  const hooksToCall = target.resolved?.hooks?.filter(
    hook => hook.type === hookType && hook.key === ModuleHookKey.Any
  );

  if (hooksToCall && hooksToCall.length > 0) {
    for (const hook of hooksToCall) {
      await invokeAnyHook(hook, source, suppressErrors, errors);
    }
  }
}

export async function invokeSpecKeyHooks(
  target: ModuleConfig,
  scope: ModuleScope,
  hookType: ModuleHookType,
  forHookKey?: string,
  suppressErrors?: boolean,
  errors?: Error[]
) {
  const hooksToCall = target.resolved?.hooks?.filter(
    hook =>
      hook.type === hookType &&
      typeof hook.key === 'string' &&
      !hook.called &&
      (forHookKey ? hook.key === forHookKey : true)
  );

  if (hooksToCall && hooksToCall.length > 0) {
    for (const hook of hooksToCall) {
      const module = scope.modules.get(hook.key as string);

      if (module?.isInstalled()) {
        await invokeHook(hook, module.config, suppressErrors, errors);
      }
    }
  }
}

export async function invokeSpecKeyArrayHooks(
  target: ModuleConfig,
  scope: ModuleScope,
  hookType: ModuleHookType,
  forHookKey?: string,
  suppressErrors?: boolean,
  errors?: Error[]
) {
  const hooksToCall = target.resolved?.hooks?.filter(
    hook =>
      hook.type === hookType &&
      Array.isArray(hook.key) &&
      !hook.called &&
      (forHookKey ? hook.key.includes(forHookKey) : true)
  );

  if (hooksToCall && hooksToCall.length > 0) {
    const moduleMap = scope.modules.toMap();

    for (const hook of hooksToCall) {
      const keys = hook.key as string[];
      const configs: ModuleConfig[] = [];

      for (const key of keys) {
        const module = moduleMap.get(key);
        if (module?.isInstalled()) {
          configs.push(module.config);
        }
      }

      if (configs.length === keys.length) {
        await invokeHook(hook, configs, suppressErrors, errors);
      }
    }
  }
}

export async function invokeAllSpecKeyHooks(
  target: ModuleConfig,
  scope: ModuleScope,
  hookType: ModuleHookType,
  forHookKey?: string,
  suppressErrors?: boolean,
  errors?: Error[]
) {
  await invokeSpecKeyHooks(
    target,
    scope,
    hookType,
    forHookKey,
    suppressErrors,
    errors
  );
  await invokeSpecKeyArrayHooks(
    target,
    scope,
    hookType,
    forHookKey,
    suppressErrors,
    errors
  );
}

export async function invokeHook(
  hook: ModuleHookConfig,
  target: ModuleConfig | ModuleConfig[],
  suppressErrors?: boolean,
  errors?: Error[]
) {
  if (hook.lock || hook.called) {
    return;
  }

  hook.lock = true;
  try {
    await invokeHookCallback(hook, target);
    hook.lock = false;
    hook.called = true;
  } catch (e) {
    hook.lock = false;
    if (suppressErrors) {
      errors?.push(e as Error);
    } else {
      throw e;
    }
  }
}

export async function invokeAnyHook(
  hook: ModuleHookConfig,
  target: ModuleConfig,
  suppressErrors?: boolean,
  errors?: Error[]
): Promise<void> {
  const id = target.id;
  if (!id) {
    return;
  }

  if (!hook.lockFor) {
    hook.lockFor = new Map();
  }

  if (!hook.calledFor) {
    hook.calledFor = new Map();
  }

  if (hook.lockFor.get(id) || hook.calledFor.get(id)) {
    return;
  }

  hook.lockFor.set(id, true);
  try {
    await invokeHookCallback(hook, target);
    hook.lockFor.set(id, false);
    hook.calledFor.set(id, true);
  } catch (e) {
    hook.lockFor.set(id, false);
    if (suppressErrors) {
      errors?.push(e as Error);
    } else {
      throw e;
    }
  }
}

export async function invokeHookCallback(
  hook: ModuleHookConfig,
  target: ModuleConfig | ModuleConfig[]
): Promise<void> {
  await hook.callback(target);
}

export function areAllModulesInstalled(scope: ModuleScope): boolean {
  return scope.modules.isInstalled();
}

export function getAllModules(scope: ModuleScope): ModuleConfig<any, any>[] {
  return scope.modules.toArray().map(m => m.config);
}
