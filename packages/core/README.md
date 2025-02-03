# @vuemodule/core [![npm version](https://img.shields.io/npm/v/@vuemodule/core.svg)](https://npmjs.org/package/@vuemodule/core) [![npm downloads](https://img.shields.io/npm/dm/@vuemodule/core.svg)](https://npmjs.org/package/@vuemodule/core)

> Core library for Vue Module, enabling dynamic module loading in Vue applications using async dynamic imports.

[Documentation & Demo](https://vuemodule.org)

## Installation

```bash
# npm
$ npm install @vuemodule/core

# yarn
$ yarn add @vuemodule/core

# pnpm
$ pnpm add @vuemodule/core
```

## Usage

### Defining a Module

#### moduleA.ts

A module with input options and a return value:

```ts
import { defineModule } from '@vuemodule/core';

export interface ModuleOptions {
  foo: string;
}

export interface ModuleReturn {
  bar: string;
}

declare module '@vuemodule/core' {
  interface ModuleMap {
    moduleA: ModuleReturn;
  }
}

export default defineModule<ModuleOptions, ModuleReturn>(
  'moduleA',
  ({ options }) => {
    console.log(options); // { foo: 'value' }

    return {
      bar: 'baz'
    };
  }
);
```

### Using Hooks

#### moduleB.ts

A module using hooks to interact with another module:

```ts
import { defineModule } from '@vuemodule/core';

export default defineModule(({ onInstalled, onUninstall }) => {
  onInstalled('moduleA', moduleA => {
    console.log(moduleA.exports); // { bar: 'baz' };
  });

  onUninstall('moduleA', moduleA => {
    console.log(moduleA.exports); // { bar: 'baz' };
  });
});
```

### Installing Modules

#### main.ts

Example of using a single module:

```ts
import { createModule } from '@vuemodule/core';

const moduleA = createModule(() => import('./moduleA'), { foo: 'bar' });

// Install the module
await moduleA.install();

console.log(moduleA.exports); // The object returned by the module's setup function

// Uninstall the module
await moduleA.uninstall();
```

### Managing Multiple Modules

#### main.ts

Example of using multiple modules with called hooks:

```ts
import { createModules, createModule } from '@vuemodule/core';

const modules = createModules([
  createModule(() => import('./moduleA'), { foo: 'bar' }),
  createModule(() => import('./moduleB'))
]);

// Install all modules
await modules.install();

console.log(modules.get('moduleA').exports); // The object returned by the module's setup function

// Uninstall all modules
await modules.uninstall();
```

## License

Licensed under the [MIT License](./LICENSE).
