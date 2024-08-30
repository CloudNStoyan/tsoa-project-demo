import { getFullFunctionName } from '../utils.js';
import { ESLintUtils } from '@typescript-eslint/utils';
import { getTypeName, isPromiseLike } from '@typescript-eslint/type-utils';

const DEFAULT_FUNCTION_NAMES = ['this.errorResult', 'this.noContentResult'];

/** @type {import('eslint').Rule.RuleModule} */
export default {
  meta: {
    messages: {
      wrongFirstTypeArg:
        "The first type argument of '{{ functionName }}' should be the same as method's return type '{{ correctType }}'",
    },
    type: 'problem',
    fixable: 'code',
    docs: {
      description:
        "Enforce that alternative response's first type argument is the same as its method's return type.",
      recommended: true,
    },
    schema: [],
  },
  create: (context) => {
    const { functionNames = DEFAULT_FUNCTION_NAMES } = context.options[0] || {};

    const services = ESLintUtils.getParserServices(context);
    const checker = services.program.getTypeChecker();

    let usedFunctions = [];

    function recordUsedFunctions(functionNode) {
      const fullFunctionName = getFullFunctionName(functionNode.callee);

      usedFunctions.push({
        fullFunctionName,
        arguments: functionNode.arguments,
        typeArgumentsParams: functionNode.typeArguments?.params,
        node: functionNode,
      });
    }

    function getFunctionReturnTypeName(node) {
      const signatures = services.getTypeAtLocation(node).getCallSignatures();

      if (!signatures.length) {
        return;
      }

      const methodReturnType = checker.getReturnTypeOfSignature(signatures[0]);

      if (
        isPromiseLike(services.program, methodReturnType) &&
        Array.isArray(methodReturnType.resolvedTypeArguments) &&
        methodReturnType.resolvedTypeArguments.length === 1 &&
        methodReturnType.resolvedTypeArguments[0]
      ) {
        return getTypeName(checker, methodReturnType.resolvedTypeArguments[0]);
      }

      return getTypeName(checker, methodReturnType);
    }

    return {
      'MethodDefinition FunctionExpression > BlockStatement CallExpression': (
        node
      ) => {
        recordUsedFunctions(node);
      },
      'MethodDefinition:exit': (node) => {
        const returnTypeName = getFunctionReturnTypeName(node);

        if (!returnTypeName) {
          return;
        }

        for (const usedFunction of usedFunctions) {
          if (!functionNames.includes(usedFunction.fullFunctionName)) {
            continue;
          }

          if (!Array.isArray(usedFunction.typeArgumentsParams)) {
            context.report({
              node: usedFunction.node,
              messageId: 'wrongFirstTypeArg',
              data: {
                functionName: usedFunction.fullFunctionName,
                correctType: returnTypeName,
              },
              fix: (fixer) => {
                return fixer.replaceText(
                  usedFunction.node.callee,
                  `${usedFunction.fullFunctionName}<${returnTypeName}>`
                );
              },
            });
            continue;
          }

          if (usedFunction.typeArgumentsParams.length === 0) {
            continue;
          }

          const usedFunctionTypeArgumentName = getTypeName(
            checker,
            services.getTypeAtLocation(usedFunction.typeArgumentsParams[0])
          );

          if (usedFunctionTypeArgumentName !== returnTypeName) {
            context.report({
              node: usedFunction.node,
              messageId: 'wrongFirstTypeArg',
              data: {
                functionName: usedFunction.fullFunctionName,
                correctType: returnTypeName,
              },
            });
          }
        }

        usedFunctions = [];
      },
    };
  },
};
