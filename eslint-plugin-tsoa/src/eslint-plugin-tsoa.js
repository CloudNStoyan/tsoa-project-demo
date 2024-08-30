import requireExampleDecoratorRule from './rules/require-example-decorator.js';
import validAlternativeResponseRule from './rules/valid-alternative-response.js';
import validSecurityDecoratorRule from './rules/valid-security-decorator.js';
import validExampleDecoratorTypeRule from './rules/valid-example-decorator-type.js';
import validAlternativeResponseTypeRule from './rules/valid-alternative-response-type.js';
import validResponseDecoratorTypeRule from './rules/valid-response-decorator-type.js';
import requireJsdocExampleForEnumTypeRule from './rules/require-jsdoc-example-for-enum-type.js';

/** @type {import('eslint').ESLint.Plugin} */
const plugin = {
  meta: {
    name: 'eslint-plugin-tsoa',
    version: '1.0.0',
  },
  configs: {},
  rules: {
    'require-example-decorator': requireExampleDecoratorRule,
    'valid-alternative-response': validAlternativeResponseRule,
    'valid-alternative-response-type': validAlternativeResponseTypeRule,
    'valid-security-decorator': validSecurityDecoratorRule,
    'valid-example-decorator-type': validExampleDecoratorTypeRule,
    'valid-response-decorator-type': validResponseDecoratorTypeRule,
    'require-jsdoc-example-for-enum-type': requireJsdocExampleForEnumTypeRule,
  },
  processors: {},
};

const recommendedRules = {
  'tsoa/require-example-decorator': 'error',
  'tsoa/valid-alternative-response': 'error',
  'tsoa/valid-alternative-response-type': 'error',
  'tsoa/valid-security-decorator': 'error',
  'tsoa/valid-example-decorator-type': 'error',
  'tsoa/valid-response-decorator-type': 'error',
  'tsoa/require-jsdoc-example-for-enum-type': 'error',
};

plugin.configs = {
  recommended: {
    name: 'eslint-plugin-tsoa',
    plugins: {
      tsoa: plugin,
    },
    rules: recommendedRules,
  },
  'recommended-legacy': {
    plugins: ['tsoa'],
    rules: recommendedRules,
  },
};

export default plugin;
