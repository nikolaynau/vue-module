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
import { defineModule, type ModuleMap } from '@vuemodule/core';

export interface ModuleOptions {
  foo: string;
}

export interface ModuleSetupReturn {
  bar: string;
}

declare module '@vuemodule/core' {
  interface ModuleMap {
    moduleA: ModuleSetupReturn;
  }
}

export default defineModule<ModuleOptions, ModuleSetupReturn>(
  'moduleA',
  context => {
    console.log(context.options); // { foo: 'foo' }

    return {
      bar: 'bar'
    };
  }
);
```

moduleB.ts

A module using hooks to interact with another module:

```ts
import { defineModule, onInstalled, onUninstall } from '@vuemodule/core';

export default defineModule(() => {
  onInstalled('moduleA', moduleA => {
    console.log(moduleA.bar); // 'bar';
  });

  onUninstall('moduleA', moduleA => {
    console.log(moduleA.bar); // 'bar';
  });
});
```

main.ts

Example of using a single module:

```ts
import { createModule } from '@vuemodule/core';

const moduleA = createModule(() => import('./moduleA'), { foo: 'foo' });

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

const modules = createModules(
  [() => import('./moduleA'), () => import('./moduleB')],
  {
    moduleA: { foo: 'foo' }
  }
);

// Install all modules
await modules.install();

// Install moduleA
// modules[0].install();

// Install moduleB
// modules[1].install();

// Access module configuration and exports
const { resolved } = modules.moduleA; // moduleA
console.log(resolved.exports); // The object returned by the module's setup function

// const { resolved } = modules.unnamed[0]; // moduleB

// Uninstall all modules
await modules.uninstall();
```

## License

Licensed under the [MIT License](./LICENSE).
