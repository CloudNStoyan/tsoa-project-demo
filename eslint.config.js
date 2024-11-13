import {
  baseConfig,
  configFilesConfig,
  tsoaConfig,
  typescriptConfig,
  typescriptDefinitionsConfig,
} from '@arabasta/eslint-config';
import globals from 'globals';
// import/no-unresolved doesn't support node "exports" field. https://github.com/import-js/eslint-plugin-import/issues/1810
// eslint-disable-next-line import/no-unresolved
import tseslint from 'typescript-eslint';

const typeScriptExtensions = ['ts', 'cts', 'mts', 'tsx'];

const typeScriptDefinitionExtensions = typeScriptExtensions
  .filter((x) => x !== 'tsx')
  .map((x) => `d.${x}`);

const allExtensions = ['js', 'cjs', 'mjs', 'jsx', ...typeScriptExtensions];

export default tseslint.config(
  // We use a tseslint helper function here so that we get easy "extends"
  // functionality that eslint flat config makes hard to achieve.
  // You can use this for the convenience, without using TypeScript.
  // Ideally this helper function should be provided by eslint.
  // For more information: https://typescript-eslint.io/packages/typescript-eslint/#flat-config-extends
  ...tseslint.config({
    name: 'All files',
    files: [`**/*.+(${allExtensions.join('|')})`],
    extends: [...baseConfig],
    settings: {
      'import/extensions': allExtensions.map((ext) => `.${ext}`),
      'import/resolver': {
        node: {
          extensions: allExtensions.map((ext) => `.${ext}`),
        },
      },
    },
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
      'import/no-restricted-paths': [
        'error',
        {
          zones: [
            {
              target: './',
              from: `./src/**/*.+(spec|test).+(${allExtensions.join('|')})`,
              message: 'Importing test files in non-test files is not allowed.',
            },
            {
              target: './',
              from: `./__mocks__`,
              message:
                'Importing mock modules in non-test files is not allowed.',
            },
            {
              target: './',
              from: './src/testing',
              message:
                'Importing testing utilities in non-test files is not allowed.',
            },
          ],
        },
      ],
    },
  }),

  ...tseslint.config({
    name: 'TypeScript files',
    files: [`**/*.+(${typeScriptExtensions.join('|')})`],
    extends: [...typescriptConfig],
    rules: {
      // Put your rules here.
    },
  }),

  ...tseslint.config({
    name: 'TypeScript definition files',
    files: [`**/*.+(${typeScriptDefinitionExtensions.join('|')})`],
    extends: [...typescriptDefinitionsConfig],
    rules: {
      // Put your rules here.
    },
  }),

  ...tseslint.config({
    name: 'TSOA files',
    files: ['src/routes/**'],
    extends: [...tsoaConfig],
    rules: {
      // Put your rules here.
      '@arabasta/tsoa/valid-response-decorator-type': [
        'error',
        { allowedTypes: ['ApiError'] },
      ],
    },
  }),

  ...tseslint.config({
    name: 'Root level configuration files',
    files: [
      `*.+(${allExtensions.join('|')})`,
      `__mocks__/**/*.+(${allExtensions.join('|')})`,
    ],
    extends: [...configFilesConfig],
    rules: {
      // Put your rules here.
    },
  }),

  { ignores: ['dist', 'src/generated/', 'scripts'] }
);
