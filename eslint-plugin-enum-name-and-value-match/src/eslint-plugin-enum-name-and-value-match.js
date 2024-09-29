import enumNameAndValueMatchRule from './rules/enum-name-and-value-match.js';

/** @type {import('eslint').ESLint.Plugin} */
const plugin = {
  meta: {
    name: 'eslint-plugin-enum-name-and-value-match',
    version: '1.0.0',
  },
  configs: {},
  rules: {
    'enum-name-and-value-match': enumNameAndValueMatchRule,
  },
  processors: {},
};

const recommendedRules = {
  'enum-name-and-value-match/enum-name-and-value-match': 'error',
};

plugin.configs = {
  recommended: {
    name: 'enum-name-and-value-match',
    plugins: {
      'enum-name-and-value-match': plugin,
    },
    rules: recommendedRules,
  },
  'recommended-legacy': {
    plugins: ['enum-name-and-value-match'],
    rules: recommendedRules,
  },
};

export default plugin;
