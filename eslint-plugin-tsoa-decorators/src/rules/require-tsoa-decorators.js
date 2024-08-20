/** @type {import('eslint').Rule.RuleModule} */
const meta = {
  messages: {
    missingRequiredDecorators:
      'The following required decorators are missing: [ {{ decorators }} ].',
  },
  type: 'problem',
  hasSuggestions: false,
  docs: {
    description: 'Enforce that required decorators are used.',
    recommended: true,
  },
  schema: [],
};

const METHOD_DECORATOR_NAMES = [
  'Options',
  'Get',
  'Post',
  'Put',
  'Patch',
  'Delete',
  'Head',
];

const REQUIRED_METADATA_DECORATORS = ['Example'];

function getDecoratorsInfo(MethodDefinitionNode) {
  if (!Array.isArray(MethodDefinitionNode?.decorators)) {
    return [];
  }

  const decorators = [];

  for (const decorator of MethodDefinitionNode.decorators) {
    if (decorator?.type !== 'Decorator') {
      continue;
    }

    if (decorator.expression.type === 'Identifier') {
      decorators.push(decorator.expression.name);
    }

    if (
      decorator.expression.type === 'CallExpression' &&
      decorator.expression.callee?.type === 'Identifier'
    ) {
      decorators.push(decorator.expression.callee.name);
    }
  }

  return decorators;
}

function getMethodDefinitionReturnType(methodDefinitionNode) {
  if (!methodDefinitionNode?.value?.returnType?.typeAnnotation) {
    return null;
  }

  const typeAnnotation = methodDefinitionNode.value.returnType.typeAnnotation;

  if (
    typeAnnotation.type === 'TSTypeReference' &&
    typeAnnotation.typeName.name === 'Promise'
  ) {
    return typeAnnotation.typeArguments.params[0];
  }

  return typeAnnotation;
}

function hasMethodDecorator(decorators) {
  return (
    decorators.filter((decorator) => METHOD_DECORATOR_NAMES.includes(decorator))
      .length !== 0
  );
}

function getMissingDecorators(decorators) {
  const missingDecorators = [];

  for (const requiredDecorator of REQUIRED_METADATA_DECORATORS) {
    if (!decorators.includes(requiredDecorator)) {
      missingDecorators.push(requiredDecorator);
    }
  }

  return missingDecorators;
}

function create(context) {
  return {
    MethodDefinition(node) {
      const decorators = getDecoratorsInfo(node);

      const missingDecorators = getMissingDecorators(decorators);

      const returnType = getMethodDefinitionReturnType(node);

      if (
        returnType &&
        returnType.type === 'TSArrayType' &&
        hasMethodDecorator(decorators) &&
        missingDecorators.length > 0
      ) {
        context.report({
          node,
          messageId: 'missingRequiredDecorators',
          data: {
            decorators: missingDecorators.join(', '),
          },
        });
      }
    },
  };
}

export default {
  meta,
  create,
};
