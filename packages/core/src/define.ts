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
  name: TName | undefined,
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
>(...args: any[]): ModuleDefinition<TOptions, TResult> {
  if (args.length === 2) {
    return defineModule({ meta: { name: args[0] }, setup: args[1] });
  } else if (args.length === 1) {
    if (typeof args[0] === 'function') {
      return defineModule({
        setup: args[0]
      });
    } else {
      return args[0];
    }
  } else {
    return defineModule({ setup: undefined });
  }
}
