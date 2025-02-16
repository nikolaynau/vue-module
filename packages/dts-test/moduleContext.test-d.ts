import { expectType } from 'tsd';
import { defineModule } from '@vuemodule/core';
import type {
  ModuleInstance,
  ModuleContext,
  ModuleOptions
} from '@vuemodule/core';
import type { ModuleAReturn } from './moduleA';

defineModule(context => {
  expectType<ModuleContext>(context);
});

type CustomOptions = {
  customOption: string;
  flag: boolean;
};

defineModule<CustomOptions>(context => {
  expectType<ModuleContext<CustomOptions>>(context);

  expectType<ModuleInstance | undefined>(context.getModule('test-module'));
  expectType<ModuleInstance<ModuleOptions, ModuleAReturn> | undefined>(
    context.getModule('moduleA')
  );
});
