import pluginVue from 'eslint-plugin-vue';
import vueTsEslintConfig from '@vue/eslint-config-typescript';
import skipFormattingConfig from '@vue/eslint-config-prettier/skip-formatting';

export default [
  ...pluginVue.configs['flat/essential'],
  ...vueTsEslintConfig(),
  skipFormattingConfig,
  {
    ignores: ['dist/*']
  }
];
