import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import tseslint from 'typescript-eslint';
import globals from 'globals';
import babelParser from '@babel/eslint-parser';
import babelPluginSyntaxImportAssertions from '@babel/plugin-syntax-import-assertions';
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
      parser: babelParser,
      parserOptions: {
        requireConfigFile: false,
        babelOptions: {
          plugins: [babelPluginSyntaxImportAssertions],
        },
      },
    },
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
  prettier,
  {
    files: ['**/*.ts'],
    extends: [
      jsdoc.configs['flat/recommended-typescript-error'],
      {
        rules: {
          'jsdoc/check-tag-names': [
            'error',
            {
              definedTags: ['pattern', 'format', 'isInt'],
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
          'jsdoc/require-example': ['error', { exemptedBy: ['summary'] }],
          'jsdoc/require-throws': 'error',
        },
      },
      prettier,
    ],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parser: tseslint.parser,
      parserOptions: {
        project: ['tsconfig.json'],
      },
    },
  },
  { ignores: ['dist', 'src/generated/client'] }
);