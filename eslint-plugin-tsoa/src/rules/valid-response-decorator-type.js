import { getTypeName } from '@typescript-eslint/type-utils';
import { ESLintUtils } from '@typescript-eslint/utils';

const DEFAULT_ALLOWED_TYPES = 'any';

/** @type {import('eslint').Rule.RuleModule} */
export default {
  meta: {
    messages: {
      requiredTypeArguments:
        'The Response decorator is required to have type arguments.',
      firstTypeArgIsNotFromTheAllowedTypes:
        "The first type argument of the Response decorator should be one of '{{ allowedTypes }}'",
    },
    type: 'problem',
    docs: {
      description:
        "Enforce that Response's first type argument exists and optionally is one of the allowed types.",
      recommended: true,
    },
    schema: [
      {
        additionalProperties: false,
        properties: {
          allowedTypes: {
            anyOf: [
              {
                items: {
                  type: 'string',
                },
                type: 'array',
              },
              {
                enum: ['any'],
              },
            ],
          },
        },
      },
    ],
  },
  create: (context) => {
    const { allowedTypes = DEFAULT_ALLOWED_TYPES } = context.options[0] || {};

    const services = ESLintUtils.getParserServices(context);
    const checker = services.program.getTypeChecker();

    return {
      Decorator(node) {
        if (
          node.expression.type !== 'CallExpression' ||
          node.expression.callee.type !== 'Identifier' ||
          node.expression.callee.name !== 'Response'
        ) {
          return;
        }

        const decoratorArguments = node.expression.arguments;

        if (
          !Array.isArray(decoratorArguments) ||
          decoratorArguments.length === 0
        ) {
          return;
        }

        const responseStatusCode = String(decoratorArguments[0].value);

        if (
          !responseStatusCode.startsWith('4') &&
          !responseStatusCode.startsWith('5')
        ) {
          return;
        }

        const typeArguments = node.expression.typeArguments;

        if (
          !(
            typeArguments &&
            typeArguments.type === 'TSTypeParameterInstantiation' &&
            Array.isArray(typeArguments.params) &&
            typeArguments.params.length > 0 &&
            typeArguments.params[0]
          )
        ) {
          context.report({
            node,
            messageId: 'requiredTypeArguments',
          });
          return;
        }

        if (allowedTypes === 'any') {
          return;
        }

        const firstTypeParamTypeName = getTypeName(
          checker,
          services.getTypeAtLocation(typeArguments.params[0])
        );

        if (!allowedTypes.includes(firstTypeParamTypeName)) {
          context.report({
            node,
            messageId: 'firstTypeArgIsNotFromTheAllowedTypes',
            data: {
              allowedTypes: allowedTypes.join(', '),
            },
          });
        }
      },
    };
  },
};
