import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import tseslint from 'typescript-eslint';
import globals from 'globals';
import jsdoc from 'eslint-plugin-jsdoc';
import tsoa from './eslint-plugin-tsoa/src/eslint-plugin-tsoa.js';
import enumNameAndValueMatch from './eslint-plugin-enum-name-and-value-match/src/eslint-plugin-enum-name-and-value-match.js';

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
      'no-unused-vars': 'off',
      'no-dupe-class-members': 'off',
    },
  },
  prettier,
  {
    files: ['**/*.ts'],
    languageOptions: {
      parserOptions: {
        project: ['tsconfig.json'],
      },
    },
  },
  {
    files: ['src/routes/**'],
    extends: [jsdoc.configs['flat/recommended-typescript-error'], prettier],
    plugins: {
      '@typescript-eslint': tseslint.plugin,
    },
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
            'isBoolean',
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
              comment:
                'JsdocBlock:not(*:has(JsdocTag[tag=isInt], JsdocTag[tag=isFloat], JsdocTag[tag=isLong], JsdocTag[tag=isDouble]))',
              context:
                'TSPropertySignature[typeAnnotation.typeAnnotation.type="TSNumberKeyword"],TSTypeAliasDeclaration[typeAnnotation.type="TSNumberKeyword"]',
              message:
                'Missing JSDoc number type declaration (@isInt, @isFloat, @isLong, @isDouble).',
            },
          ],
        },
      ],
      '@typescript-eslint/explicit-function-return-type': 'error',
      'no-restricted-syntax': [
        'error',
        {
          selector: 'TSUnionType',
          message: 'Unions are not allowed.',
        },
      ],
    },
  },
  {
    files: ['src/routes/**'],
    plugins: tsoa.configs.recommended.plugins,
    rules: {
      ...tsoa.configs.recommended.rules,
      'tsoa/valid-response-decorator-type': [
        'error',
        { allowedTypes: ['ApiError'] },
      ],
    },
  },
  {
    files: ['src/routes/**'],
    plugins: enumNameAndValueMatch.configs.recommended.plugins,
    rules: { ...enumNameAndValueMatch.configs.recommended.rules },
  },
  { ignores: ['dist', 'src/generated/'] }
);
