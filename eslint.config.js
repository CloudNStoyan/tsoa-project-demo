import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import tseslint from 'typescript-eslint';
import globals from 'globals';
import jsdoc from 'eslint-plugin-jsdoc';
import tsoaDecorators from './eslint-plugin-tsoa-decorators/src/eslint-plugin-tsoa-decorators.js';

export default tseslint.config(
  js.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
      },
      ecmaVersion: 'latest',
      sourceType: 'module',
      parser: tseslint.parser,
    },
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
  prettier,
  {
    files: ['**/*.ts'],
    extends: [jsdoc.configs['flat/recommended-typescript-error'], prettier],
    languageOptions: {
      parserOptions: {
        project: ['tsconfig.json'],
      },
    },
  },
  {
    files: ['src/routes/**'],
    rules: {
      'jsdoc/check-tag-names': [
        'error',
        {
          definedTags: [
            'format',
            'isDateTime',
            'isDate',
            'minDate',
            'maxDate',
            'isInt',
            'isFloat',
            'isLong',
            'isDouble',
            'minimum',
            'maximum',
            'isString',
            'minLength',
            'maxLength',
            'pattern',
            'isArray',
            'minItems',
            'maxItems',
            'uniqueItems',
            'isBool',
          ],
        },
      ],
      'jsdoc/check-indentation': 'error',
      'jsdoc/check-line-alignment': [
        'error',
        'always',
        {
          tags: [
            'param',
            'arg',
            'argument',
            'property',
            'prop',
            'returns',
            'return',
            'summary',
            'isInt',
            'pattern',
            'format',
          ],
        },
      ],
      'jsdoc/no-blank-block-descriptions': 'error',
      'jsdoc/no-blank-blocks': ['error', { enableFixer: true }],
      'jsdoc/require-asterisk-prefix': 'error',
      'jsdoc/require-description': 'error',
      'jsdoc/require-description-complete-sentence': 'error',
      'jsdoc/require-example': [
        'error',
        {
          contexts: ['TSInterfaceDeclaration TSPropertySignature'],
        },
      ],
      'jsdoc/require-throws': 'error',
      'jsdoc/require-jsdoc': [
        'error',
        {
          require: {
            MethodDefinition: true,
          },
          contexts: [
            'TSTypeAliasDeclaration',
            'TSInterfaceDeclaration',
            'TSInterfaceDeclaration TSPropertySignature',
          ],
        },
      ],
      'jsdoc/no-restricted-syntax': [
        'error',
        {
          contexts: [
            {
              comment: 'JsdocBlock:not(*:has(JsdocTag[tag=summary]))',
              context: 'MethodDefinition',
              message: 'Missing JSDoc @summary declaration.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/routes/**'],
    plugins: {
      'tsoa-decorators': tsoaDecorators,
    },
    rules: {
      'tsoa-decorators/require-tsoa-decorators': 'error',
      'tsoa-decorators/alternative-responses-require-decorators': 'error',
    },
  },
  { ignores: ['dist', 'src/generated/client'] }
);
