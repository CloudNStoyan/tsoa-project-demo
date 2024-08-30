import {
  getFullFunctionName,
  getAllDecoratorsWithName,
  hasResponseDecoratorWithStatus,
} from '../utils.js';

const DEFAULT_FUNCTION_NAMES = ['this.errorResult', 'this.noContentResult'];
const DEFAULT_SPECIAL_STATUSES = [
  {
    functionName: 'this.noContentResult',
    statusCode: 204,
  },
];

/** @type {import('eslint').Rule.RuleModule} */
export default {
  meta: {
    messages: {
      noCorrectResponseDecorator:
        "Using '{{ functionName }}' inside a method requires you to have '@Response({{ status }})' decorator on the method",
    },
    type: 'problem',
    docs: {
      description:
        'Enforce that correct response decorators are used when using alternative responses.',
      recommended: true,
    },
    fixable: 'code',
    schema: [
      {
        additionalProperties: false,
        properties: {
          functionNames: {
            items: {
              type: 'string',
            },
            type: 'array',
            default: DEFAULT_FUNCTION_NAMES,
          },
          specialStatuses: {
            items: {
              type: 'object',
              properties: {
                functionName: {
                  type: 'string',
                },
                statusCode: {
                  type: 'number',
                },
              },
            },
            type: 'array',
            default: [],
          },
        },
      },
    ],
  },
  create(context) {
    const {
      functionNames = DEFAULT_FUNCTION_NAMES,
      specialStatuses = DEFAULT_SPECIAL_STATUSES,
    } = context.options[0] || {};

    const specialStatusesMap = new Map();

    for (const specialStatus of specialStatuses) {
      specialStatusesMap.set(
        specialStatus.functionName,
        specialStatus.statusCode
      );
    }

    let usedFunctions = [];

    function recordUsedFunctions(functionNode) {
      const fullFunctionName = getFullFunctionName(functionNode.callee);

      usedFunctions.push({
        fullFunctionName,
        arguments: functionNode.arguments,
        typeArguments: functionNode.typeArguments?.params,
        node: functionNode,
      });
    }

    let currentClassDeclarationNode;

    return {
      ClassDeclaration(node) {
        currentClassDeclarationNode = node;
      },
      'MethodDefinition FunctionExpression > BlockStatement CallExpression': (
        node
      ) => {
        recordUsedFunctions(node);
      },
      'MethodDefinition:exit': (node) => {
        const responseDecorators = [
          ...getAllDecoratorsWithName({
            node,
            decoratorName: 'Response',
          }),
          ...getAllDecoratorsWithName({
            node: currentClassDeclarationNode,
            decoratorName: 'Response',
          }),
        ];

        for (const usedFunction of usedFunctions) {
          if (!functionNames.includes(usedFunction.fullFunctionName)) {
            continue;
          }

          let status;
          if (specialStatusesMap.has(usedFunction.fullFunctionName)) {
            status = specialStatusesMap.get(usedFunction.fullFunctionName);
          } else {
            if (
              !Array.isArray(usedFunction.arguments) ||
              usedFunction.arguments.length === 0
            ) {
              continue;
            }

            status = usedFunction.arguments[0].value;
          }

          if (
            !Array.isArray(responseDecorators) ||
            !hasResponseDecoratorWithStatus({
              status,
              decorators: responseDecorators,
            })
          ) {
            context.report({
              node,
              messageId: 'noCorrectResponseDecorator',
              data: {
                functionName: usedFunction.fullFunctionName,
                status,
              },
            });
          }
        }

        usedFunctions = [];
      },
    };
  },
};
