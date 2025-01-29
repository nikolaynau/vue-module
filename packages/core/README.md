# @vuemodule/core [![npm version](https://img.shields.io/npm/v/@vuemodule/core.svg)](https://npmjs.org/package/@vuemodule/core) [![npm downloads](https://img.shields.io/npm/dm/@vuemodule/core.svg)](https://npmjs.org/package/@vuemodule/core)

> Core library for Vue Module, enabling dynamic module loading in Vue applications using dynamic imports.

[Documentation & Demo](https://vuemodule.org)

## Installation

```bash
# NPM
$ npm install @vuemodule/core

# Yarn
$ yarn add @vuemodule/core

# pnpm
$ pnpm add @vuemodule/core
```

## Usage

moduleA.ts

A module with input options and a return value:

```ts
import { defineModule } from '@vuemodule/core';

export interface ModuleAOptions {
  foo: string;
}

export interface ModuleAReturn {
  bar: string;
}

declare module '@vuemodule/core' {
  interface ModuleMap {
    moduleA: ModuleAReturn;
  }
}

export default defineModule<ModuleAOptions, ModuleAReturn>('moduleA', ctx => {
  console.log(ctx.options); // { foo: 'value' }

  return {
    bar: 'baz'
  };
});
```

moduleB.ts

A module using hooks to interact with another module:

```ts
import { defineModule } from '@vuemodule/core';

export default defineModule(ctx => {
  ctx.onInstalled('moduleA', moduleA => {
    const { resolved } = moduleA;
    console.log(resolved?.exports?.bar); // 'baz';
  });

  ctx.onUninstall('moduleA', moduleA => {
    const { resolved } = moduleA;
    console.log(resolved?.exports?.bar); // 'baz';
  });
});
```

main.ts

Example of using a single module:

```ts
import { createModule } from '@vuemodule/core';

const moduleA = createModule(() => import('./moduleA'), { foo: 'bar' });

// Install the module
await moduleA.install();

// Access module configuration and exports
const { resolved } = moduleA.config;
console.log(resolved.exports); // The object returned by the module's setup function

// Uninstall the module
await moduleA.uninstall();
```

main.ts

Example of using multiple modules with called hooks:

```ts
import { createModules } from '@vuemodule/core';

const modules = createModules([
  [() => import('./moduleA'), { foo: 'bar' }],
  () => import('./moduleB')
]);

// Install all modules
await modules.install();

// Install moduleA
await modules[0].install();

// Install moduleB
await modules[1].install();

// Access module configuration and exports
const { resolved } = modules.moduleA; // moduleA
console.log(resolved.exports); // The object returned by the module's setup function

// const { resolved } = modules.unnamed[0]; // moduleB

// Uninstall all modules
await modules.uninstall();
```

## License

Licensed under the [MIT License](./LICENSE).
