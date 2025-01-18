import { defineBuildConfig } from 'unbuild';

export default defineBuildConfig({
  entries: ['src/index'],
  externals: [],
  declaration: false,
  clean: true,
  rollup: {
    emitCJS: true,
    inlineDependencies: true
  }
});
