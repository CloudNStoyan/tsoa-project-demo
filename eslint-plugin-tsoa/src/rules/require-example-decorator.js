import { hasDecoratorWithName, hasHttpMethodDecorator } from '../utils.js';

/** @type {import('eslint').Rule.RuleModule} */
export default {
  meta: {
    messages: {
      missingRequiredDecorators:
        'The Example decorator is required when the method returns an array.',
    },
    type: 'problem',
    docs: {
      description:
        'Enforce that Example decorator is used when the method returns an array.',
      recommended: true,
    },
    schema: [],
  },
  create(context) {
    function getMethodDefinitionReturnType(methodDefinitionNode) {
      if (!methodDefinitionNode?.value?.returnType?.typeAnnotation) {
        return null;
      }

      const typeAnnotation =
        methodDefinitionNode.value.returnType.typeAnnotation;

      if (
        typeAnnotation.type === 'TSTypeReference' &&
        typeAnnotation.typeName.name === 'Promise'
      ) {
        return typeAnnotation.typeArguments.params[0];
      }

      return typeAnnotation;
    }

    return {
      MethodDefinition(node) {
        const returnType = getMethodDefinitionReturnType(node);

        if (
          returnType &&
          returnType.type === 'TSArrayType' &&
          hasHttpMethodDecorator(node) &&
          !hasDecoratorWithName({ node, decoratorName: 'Example' })
        ) {
          context.report({
            node,
            messageId: 'missingRequiredDecorators',
          });
        }
      },
    };
  },
};
