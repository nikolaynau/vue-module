import type {
  ModuleDefinition,
  ModuleOptions,
  ModuleSetupFunction,
  ModuleSetupReturn
} from './types';

export function defineModule<
  TOptions extends ModuleOptions = ModuleOptions,
  TResult extends ModuleSetupReturn = ModuleSetupReturn
>(
  name: string,
  setup: ModuleSetupFunction<TOptions, TResult>
): ModuleDefinition<TOptions>;
export function defineModule<
  TOptions extends ModuleOptions = ModuleOptions,
  TResult extends ModuleSetupReturn = ModuleSetupReturn
>(setup: ModuleSetupFunction<TOptions, TResult>): ModuleDefinition<TOptions>;
export function defineModule<
  TOptions extends ModuleOptions = ModuleOptions,
  TResult extends ModuleSetupReturn = ModuleSetupReturn
>(definition: ModuleDefinition<TOptions, TResult>): ModuleDefinition<TOptions>;
export function defineModule<
  TOptions extends ModuleOptions = ModuleOptions,
  TResult extends ModuleSetupReturn = ModuleSetupReturn
>(
  definition: unknown,
  setup?: ModuleSetupFunction<TOptions, TResult>
): ModuleDefinition<TOptions> {
  if (typeof definition === 'function') {
    return defineModule({
      setup: definition as ModuleSetupFunction<TOptions, TResult>
    });
  } else if (typeof definition === 'string') {
    return defineModule({ meta: { name: definition }, setup });
  } else {
    return definition as ModuleDefinition<TOptions>;
  }
}
