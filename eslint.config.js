import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import tseslint from 'typescript-eslint';
import globals from 'globals';
import jsdoc from 'eslint-plugin-jsdoc';

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
          contexts: [
            'TSInterfaceDeclaration TSPropertySignature:not([typeAnnotation.typeAnnotation.type="TSArrayType"], [typeAnnotation.typeAnnotation.type="TSTypeReference"])',
          ],
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
            {
              comment: 'JsdocBlock:has(JsdocTag[tag=example])',
              context:
                'TSPropertySignature[typeAnnotation.typeAnnotation.type="TSArrayType"]',
              message: 'Using JSDoc @example on arrays is forbidden.',
            },
            {
              comment: 'JsdocBlock:has(JsdocTag[tag=example])',
              context:
                'TSPropertySignature[typeAnnotation.typeAnnotation.type="TSTypeReference"]',
              message: 'Using JSDoc @example on complex types is forbidden.',
            },
            {
              comment:
                'JsdocBlock:not(*:has(JsdocTag[tag=isInt], JsdocTag[tag=isFloat], JsdocTag[tag=isLong], JsdocTag[tag=isDouble]))',
              context:
                'TSPropertySignature[typeAnnotation.typeAnnotation.type="TSNumberKeyword"]',
              message:
                'Missing JSDoc one of [@isInt, @isFloat, @isLong, @isDouble] declaration.',
            },
          ],
        },
      ],
    },
  },
  { ignores: ['dist', 'src/generated/client'] }
);
