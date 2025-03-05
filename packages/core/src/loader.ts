import { createModuleContext } from './context';
import type {
  ModuleConfig,
  ModuleDefinition,
  ModuleLoader,
  ModuleMeta,
  ModuleOptions,
  ModuleSetupFunction,
  ModuleSetupReturn
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

  const [context, hooks] = createModuleContext<T>(
    moduleDefinition.meta,
    resolvedOptions,
    config.scope
  );

  const moduleExports = await moduleDefinition.setup(context!);
  if (moduleExports === false) {
    return config;
  }

  config.resolved = {
    options: context.options,
    exports: moduleExports as R,
    meta: context.meta,
    hooks: [...hooks],
    disposed: false
  };

  hooks.length = 0;

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
