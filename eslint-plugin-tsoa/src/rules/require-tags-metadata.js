import fs from 'node:fs';

const TSOA_CONFIG_FILEPATH = './tsoa.json';

/** @type {import('eslint').Rule.RuleModule} */
export default {
  meta: {
    messages: {
      tagNotDefinedInConfig:
        "The following tags are missing from the tsoa.json config '{{ missingTagNames }}'",
    },
    type: 'problem',
    docs: {
      description:
        'Enforce that all tags used in the @Tags decorator are present in the tsoa.json config.',
      recommended: true,
    },
    schema: [],
  },
  create: (context) => {
    const decorators = [];

    function getDefinedTsoaTagNames(tsoaConfig) {
      if (Array.isArray(tsoaConfig.spec?.tags)) {
        return tsoaConfig.spec.tags
          .filter((tag) => typeof tag.name === 'string')
          .map((tag) => tag.name);
      }

      return [];
    }

    return {
      Decorator(node) {
        if (
          node.expression.type !== 'CallExpression' ||
          node.expression.callee.type !== 'Identifier' ||
          node.expression.callee.name !== 'Tags'
        ) {
          return;
        }

        decorators.push(node);
      },
      'Program:exit': () => {
        if (decorators.length === 0) {
          return;
        }

        let tsoaConfigJson;
        try {
          tsoaConfigJson = fs.readFileSync(TSOA_CONFIG_FILEPATH, {
            encoding: 'utf-8',
          });
        } catch (error) {
          console.warn(error);
          return;
        }

        let tsoaConfig;
        try {
          tsoaConfig = JSON.parse(tsoaConfigJson);
        } catch (error) {
          console.warn(error);
          return;
        }

        if (typeof tsoaConfig !== 'object') {
          console.warn(
            `Expected tsoa config to be an object but got '${typeof tsoaConfig}' instead.`
          );
          return;
        }

        const tsoaTagNames = getDefinedTsoaTagNames(tsoaConfig);

        for (const decorator of decorators) {
          const expression = decorator.expression;

          if (!Array.isArray(expression.arguments)) {
            continue;
          }

          const missingTagNames = [];

          for (const tagArg of expression.arguments) {
            if (tagArg.type !== 'Literal') {
              continue;
            }

            const tagName = tagArg.value;

            if (!tsoaTagNames.includes(tagName)) {
              missingTagNames.push(tagName);
            }
          }

          if (missingTagNames.length > 0) {
            context.report({
              node: decorator,
              messageId: 'tagNotDefinedInConfig',
              data: {
                missingTagNames: missingTagNames.join(', '),
              },
            });
          }
        }
      },
    };
  },
};
