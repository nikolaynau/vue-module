import { defineBuildConfig } from 'unbuild';

export default defineBuildConfig([
  {
    entries: ['src/index'],
    clean: true,
    declaration: 'compatible',
    rollup: {
      emitCJS: true
    }
  },
  {
    entries: ['src/node/cli'],
    declaration: false,
    rollup: {
      emitCJS: true
    }
  }
]);
