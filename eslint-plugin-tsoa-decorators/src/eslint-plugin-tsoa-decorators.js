import requireTsoaDecoratorsRule from './rules/require-tsoa-decorators.js';
import alternativeResponsesRequireDecoratorsRule from './rules/alternative-responses-require-decorators.js';

/** @type {import('eslint').ESLint.Plugin} */
const plugin = {
  meta: {
    name: 'eslint-plugin-tsoa-decorators',
    version: '1.0.0',
  },
  configs: {},
  rules: {
    'require-tsoa-decorators': requireTsoaDecoratorsRule,
    'alternative-responses-require-decorators':
      alternativeResponsesRequireDecoratorsRule,
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
      'tsoa-decorators/alternative-responses-require-decorators': 'error',
    },
  },
  'recommended-legacy': {
    plugins: ['tsoa-decorators'],
    rules: {
      'tsoa-decorators/require-tsoa-decorators': 'error',
      'tsoa-decorators/alternative-responses-require-decorators': 'error',
    },
  },
};

export default plugin;
