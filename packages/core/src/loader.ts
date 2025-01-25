import {
  createInternalContext,
  setActiveContext,
  type ModuleInternalContext
} from './context';
import type {
  ModuleConfig,
  ModuleContext,
  ModuleDefinition,
  ModuleLoader,
  ModuleMeta,
  ModuleOptions,
  ModuleSetupFunction,
  ModuleSetupReturn,
  ResolvedModule
} from './types';

export async function loadModule<
  T extends ModuleOptions,
  R extends ModuleSetupReturn
>(config: ModuleConfig<T, R>): Promise<ModuleConfig<T, R>> {
  if (!isValidLoader(config.loader)) {
    return config;
  }

  const moduleDefinition = await loadModuleDefinition(config.loader);
  if (!moduleDefinition) {
    return config;
  }

  if (!isValidSetupFunction(moduleDefinition.setup)) {
    return config;
  }

  const resolvedOptions = await resolveOptions(
    config.options,
    moduleDefinition.meta
  );
  const context = createModuleContext(moduleDefinition.meta, resolvedOptions);
  const internalContext = createInternalContext();

  setActiveContext(internalContext);

  try {
    const moduleExports = await moduleDefinition.setup(context);
    if (moduleExports === false) {
      return config;
    }

    config.resolved = createResolvedData(
      moduleExports as R | undefined,
      resolvedOptions,
      moduleDefinition.meta,
      internalContext
    );
  } finally {
    setActiveContext(undefined);
  }

  return config;
}

function isValidLoader<T extends ModuleOptions, R extends ModuleSetupReturn>(
  loader: ModuleLoader<T, R>
): loader is ModuleLoader<T, R> {
  return typeof loader === 'function';
}

function isValidSetupFunction<
  T extends ModuleOptions,
  R extends ModuleSetupReturn
>(
  setup: ModuleSetupFunction<T, R> | undefined
): setup is ModuleSetupFunction<T, R> {
  return typeof setup === 'function';
}

async function loadModuleDefinition<
  T extends ModuleOptions,
  R extends ModuleSetupReturn
>(loader: ModuleLoader<T, R>): Promise<ModuleDefinition<T, R> | undefined> {
  const result = (await loader()) as {
    default: ModuleDefinition<T, R> | undefined;
  };
  return result?.default
    ? result?.default
    : (result as ModuleDefinition<T, R> | undefined);
}

async function resolveOptions<
  T extends ModuleOptions,
  R extends ModuleSetupReturn
>(
  options: ModuleConfig<T, R>['options'],
  meta?: ModuleMeta
): Promise<T | undefined> {
  return typeof options === 'function' ? await options(meta) : options;
}

function createModuleContext<T extends ModuleOptions>(
  meta?: ModuleMeta,
  options?: T
): ModuleContext<T> {
  return {
    meta: { ...meta },
    options: options ?? ({} as T)
  };
}

function createResolvedData<
  T extends ModuleOptions,
  R extends ModuleSetupReturn
>(
  moduleExports: R | undefined,
  resolvedOptions: T | undefined,
  meta: ModuleMeta | undefined,
  internalContext: ModuleInternalContext
): ResolvedModule<T, R> {
  return {
    options: resolvedOptions,
    exports: moduleExports,
    meta: { ...meta, ...internalContext.meta },
    hooks: internalContext.hooks,
    disposed: false
  };
}
