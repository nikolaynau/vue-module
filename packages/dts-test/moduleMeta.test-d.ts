import { expectType, expectError } from 'tsd';
import type { ModuleMeta } from '@vuemodule/core';

const validMeta: ModuleMeta = {
  name: 'MyModule',
  version: '1.0.0',
  customKey: 'SomeValue'
};
expectType<string | undefined>(validMeta.name);
expectType<string | undefined>(validMeta.version);
expectType<any>(validMeta.customKey);

expectError<ModuleMeta>({
  name: 123
});

expectError<ModuleMeta>({
  version: true
});
