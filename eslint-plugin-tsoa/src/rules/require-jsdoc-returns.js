import { getTypeName, isPromiseLike } from '@typescript-eslint/type-utils';
import { ESLintUtils } from '@typescript-eslint/utils';
import { getJSDocComment, parseComment } from '@es-joy/jsdoccomment';

const DEFAULT_DISALLOW_ON_VOID_OR_UNDEFINED = true;

/** @type {import('eslint').Rule.RuleModule} */
export default {
  meta: {
    messages: {
      returnsIsMissing: 'Missing JSDoc @returns declaration.',
      returnsIsNotAllowed:
        "JSDoc @returns declaration is not allowed on methods that return 'void' or 'undefined'.",
    },
    type: 'problem',
    docs: {
      description: 'Requires that return statements are documented.',
      recommended: true,
    },
    schema: [
      {
        additionalProperties: false,
        properties: {
          disallowOnVoidOrUndefined: {
            type: 'boolean',
            default: DEFAULT_DISALLOW_ON_VOID_OR_UNDEFINED,
          },
        },
      },
    ],
  },
  create(context) {
    const {
      disallowOnVoidOrUndefined = DEFAULT_DISALLOW_ON_VOID_OR_UNDEFINED,
    } = context.options[0] || {};

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

        const returnTypeIsUndefinedOrVoid =
          returnType === 'void' || returnType === 'undefined';
        const hasReturnsJSDocDeclaration = propertyReturns.length > 0;

        if (returnTypeIsUndefinedOrVoid) {
          if (hasReturnsJSDocDeclaration && disallowOnVoidOrUndefined) {
            context.report({
              node: jsdocNode,
              messageId: 'returnsIsNotAllowed',
            });
          }
          return;
        }

        if (!hasReturnsJSDocDeclaration) {
          context.report({
            node: jsdocNode,
            messageId: 'returnsIsMissing',
          });
        }
      },
    };
  },
};
