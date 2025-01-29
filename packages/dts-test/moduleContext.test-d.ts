import { expectType } from 'tsd';
import { defineModule, type ModuleContext } from '@vuemodule/core';

defineModule(context => {
  expectType<ModuleContext>(context);
});

type CustomOptions = {
  customOption: string;
  flag: boolean;
};

defineModule<CustomOptions>(context => {
  expectType<ModuleContext<CustomOptions>>(context);
});
