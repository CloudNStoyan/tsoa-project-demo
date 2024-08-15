import requireTsoaDecoratorsRule from './rules/require-tsoa-decorators.js';

/** @type {import('eslint').ESLint.Plugin} */
const plugin = {
  meta: {
    name: 'eslint-plugin-tsoa-decorators',
    version: '1.0.0',
  },
  configs: {},
  rules: {
    'require-tsoa-decorators': requireTsoaDecoratorsRule,
  },
  processors: {},
};

plugin.configs = {
  recommended: {
    name: 'eslint-plugin-tsoa-decorators',
    plugins: {
      'tsoa-decorators': plugin,
    },
    rules: {
      'tsoa-decorators/require-tsoa-decorators': 'error',
    },
  },
  'recommended-legacy': {
    plugins: ['tsoa-decorators'],
    rules: {
      'tsoa-decorators/require-tsoa-decorators': 'error',
    },
  },
};

export default plugin;
