# @vuemodule/core [![npm version](https://img.shields.io/npm/v/@vuemodule/core.svg)](https://npmjs.org/package/@vuemodule/core) [![npm downloads](https://img.shields.io/npm/dm/@vuemodule/core.svg)](https://npmjs.org/package/@vuemodule/core)

> Load modules using the setup function for configuration and invoking hooks.

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

#### moduleA.js

```js
import { defineModule } from '@vuemodule/core';

export default defineModule('moduleA', () => {
  return {
    bar: 'baz'
  };
});
```

### Using Hooks

#### moduleB.js

```js
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

#### main.js

Example of using a single module:

```js
import { createModule } from '@vuemodule/core';

const moduleA = createModule(() => import('./moduleA'));

// Install the module
await moduleA.install();

console.log(moduleA.exports); // The object returned by the module's setup function

// Uninstall the module
await moduleA.uninstall();
```

### Managing Multiple Modules

#### main.js

Example of using multiple modules with called hooks:

```js
import { createModules, createModule } from '@vuemodule/core';

const modules = createModules([
  () => import('./moduleA'),
  () => import('./moduleB')
]);

// Install all modules
await modules.install();

console.log(modules.get('moduleA').exports); // The object returned by the module's setup function

// Uninstall all modules
await modules.uninstall();
```

## License

Licensed under the [MIT License](./LICENSE).
