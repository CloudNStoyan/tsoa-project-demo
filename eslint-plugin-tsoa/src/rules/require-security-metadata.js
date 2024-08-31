import fs from 'node:fs';

const TSOA_CONFIG_FILEPATH = './tsoa.json';

/** @type {import('eslint').Rule.RuleModule} */
export default {
  meta: {
    messages: {
      securityDefinitionNotDefinedInConfig:
        "The following security definitions are missing from the tsoa.json config '{{ missingSecurityDefinitions }}'",
    },
    type: 'problem',
    docs: {
      description:
        'Enforce that all security definitions used in the @Security decorator are present in the tsoa.json config.',
      recommended: true,
    },
    schema: [],
  },
  create: (context) => {
    const decorators = [];

    function getDefinedTsoaSecurityDefinitions(tsoaConfig) {
      if (typeof tsoaConfig.spec?.securityDefinitions === 'object') {
        return Object.keys(tsoaConfig.spec.securityDefinitions);
      }

      return [];
    }

    return {
      Decorator(node) {
        if (
          node.expression.type !== 'CallExpression' ||
          node.expression.callee.type !== 'Identifier' ||
          node.expression.callee.name !== 'Security'
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

        const tsoaSecurityDefinitions =
          getDefinedTsoaSecurityDefinitions(tsoaConfig);

        for (const decorator of decorators) {
          const expression = decorator.expression;

          if (
            !Array.isArray(expression.arguments) ||
            !expression.arguments[0]
          ) {
            continue;
          }

          const missingSecurityDefinitions = [];

          const securityDefinitionArgument = expression.arguments[0];

          if (securityDefinitionArgument.type === 'Literal') {
            if (
              !tsoaSecurityDefinitions.includes(
                securityDefinitionArgument.value
              )
            ) {
              missingSecurityDefinitions.push(securityDefinitionArgument.value);
            }
          }

          if (
            securityDefinitionArgument.type === 'ObjectExpression' &&
            Array.isArray(securityDefinitionArgument.properties)
          ) {
            for (const property of securityDefinitionArgument.properties) {
              if (
                property.type !== 'Property' ||
                property.key?.type !== 'Identifier'
              ) {
                continue;
              }

              if (!tsoaSecurityDefinitions.includes(property.key.name)) {
                missingSecurityDefinitions.push(property.key.name);
              }
            }
          }

          if (missingSecurityDefinitions.length > 0) {
            context.report({
              node: decorator,
              messageId: 'securityDefinitionNotDefinedInConfig',
              data: {
                missingSecurityDefinitions:
                  missingSecurityDefinitions.join(', '),
              },
            });
          }
        }
      },
    };
  },
};
