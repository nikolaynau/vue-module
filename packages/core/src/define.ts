import type {
  ModuleDefinition,
  ModuleOptions,
  ModuleSetupFunction,
  ModuleSetupReturn
} from './types';

export function defineModule<
  TOptions extends ModuleOptions = ModuleOptions,
  TResult extends ModuleSetupReturn = ModuleSetupReturn,
  TName = string
>(
  name: TName,
  setup: ModuleSetupFunction<TOptions, TResult>
): ModuleDefinition<TOptions, TResult>;

export function defineModule<
  TOptions extends ModuleOptions = ModuleOptions,
  TResult extends ModuleSetupReturn = ModuleSetupReturn
>(
  setup: ModuleSetupFunction<TOptions, TResult>
): ModuleDefinition<TOptions, TResult>;

export function defineModule<
  TOptions extends ModuleOptions = ModuleOptions,
  TResult extends ModuleSetupReturn = ModuleSetupReturn
>(
  definition: ModuleDefinition<TOptions, TResult>
): ModuleDefinition<TOptions, TResult>;

export function defineModule<
  TOptions extends ModuleOptions = ModuleOptions,
  TResult extends ModuleSetupReturn = ModuleSetupReturn
>(
  arg: unknown,
  setup?: ModuleSetupFunction<TOptions, TResult>
): ModuleDefinition<TOptions, TResult> {
  if (typeof arg === 'function') {
    return defineModule({
      setup: arg as ModuleSetupFunction<TOptions, TResult>
    });
  } else if (typeof arg === 'string') {
    return defineModule({ meta: { name: arg }, setup });
  } else {
    return arg as ModuleDefinition<TOptions, TResult>;
  }
}
