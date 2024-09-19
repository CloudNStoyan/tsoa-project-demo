import { getTypeName, isPromiseLike } from '@typescript-eslint/type-utils';
import { ESLintUtils } from '@typescript-eslint/utils';
import { getJSDocComment, parseComment } from '@es-joy/jsdoccomment';

/** @type {import('eslint').Rule.RuleModule} */
export default {
  meta: {
    messages: {
      returnsIsMissing: 'Missing JSDoc @returns declaration.',
    },
    type: 'problem',
    docs: {
      description: 'Requires that return statements are documented.',
      recommended: true,
    },
    schema: [],
  },
  create(context) {
    const services = ESLintUtils.getParserServices(context);
    const checker = services.program.getTypeChecker();
    const sourceCode = context.sourceCode || context.getSourceCode();

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
      MethodDefinition(node) {
        const returnType = getFunctionReturnTypeName(node);

        if (returnType === 'void' || returnType === 'undefined') {
          return;
        }

        const jsdocNode = getJSDocComment(sourceCode, node, {
          maxLines: 1,
          minLines: 0,
        });

        if (!jsdocNode) {
          return;
        }

        const jsdoc = parseComment(jsdocNode);

        const targetTagName = 'returns';

        const propertyReturns = jsdoc.tags.filter(({ tag }) => {
          return tag === targetTagName;
        });

        if (propertyReturns.length === 0) {
          context.report({
            node,
            messageId: 'returnsIsMissing',
          });
        }
      },
    };
  },
};
