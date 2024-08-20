/** @type {import('eslint').Rule.RuleModule} */
const meta = {
  messages: {
    returnTypeAsFirstTypeArg:
      "'{{ functionName }}' should have '{{ returnType }}' as first type argument",
    wrongFirstTypeArg:
      "'{{ functionName }}' first type argument should be the same as the method return type",
    noCorrectResponseDecorator:
      "Using '{{ functionName }}' inside a method requires you to have '@Response({{ status }})' decorator on the method",
  },
  type: 'problem',
  docs: {
    description:
      'Enforce that response decorators are used when using alternative responses.',
    recommended: true,
  },
  fixable: 'code',
  schema: [],
};

/** @param {import('eslint').Rule.Node} node */
function getFullFunctionName(node) {
  if (node.type === 'Identifier' && !node.object) {
    return node.name;
  }

  const functionPath = [];

  let currentNode = node;

  while (currentNode.type === 'MemberExpression' && currentNode.object) {
    functionPath.push(currentNode.property.name);
    currentNode = currentNode.object;
  }

  if (currentNode.type === 'Identifier' && currentNode.name) {
    functionPath.push(currentNode.name);
  }

  if (currentNode.type === 'ThisExpression') {
    functionPath.push('this');
  }

  functionPath.reverse();

  const functionName = functionPath.join('.');

  return functionName;
}

function getCallExpressionDecoratorsInfo(methodDefinitionNode) {
  if (!Array.isArray(methodDefinitionNode?.decorators)) {
    return [];
  }

  const decorators = {};

  for (const decorator of methodDefinitionNode.decorators) {
    if (
      decorator?.type !== 'Decorator' ||
      decorator.expression.type !== 'CallExpression' ||
      decorator.expression.callee.type !== 'Identifier'
    ) {
      continue;
    }

    const callExpression = decorator.expression;

    const decoratorName = callExpression.callee.name;

    if (!decorators[decoratorName]) {
      decorators[decoratorName] = [];
    }

    const decoratorInfo = {
      name: callExpression.callee.name,
      arguments: callExpression.arguments,
      typeArguments: callExpression.typeArguments?.params,
    };

    decorators[decoratorName].push(decoratorInfo);
  }

  return decorators;
}

function getMethodDefinitionReturnType(methodDefinitionNode) {
  if (!methodDefinitionNode?.value?.returnType?.typeAnnotation) {
    return null;
  }

  const typeAnnotation = methodDefinitionNode.value.returnType.typeAnnotation;

  if (typeAnnotation.type !== 'TSTypeReference') {
    return null;
  }

  if (typeAnnotation.typeName.name === 'Promise') {
    return typeAnnotation.typeArguments.params[0];
  }

  return typeAnnotation;
}

let usedFunctions = [];

function recordUsedFunctions(functionNode) {
  const functionName = getFullFunctionName(functionNode.callee);

  usedFunctions.push({
    name: functionName,
    arguments: functionNode.arguments,
    typeArguments: functionNode.typeArguments?.params,
    node: functionNode,
  });
}

function areTypesEqual(type1, type2) {
  if (type1.type !== type2.type) {
    return false;
  }

  if (
    type1.type === 'TSTypeReference' &&
    type1.typeName.name !== type2.typeName.name
  ) {
    return false;
  }

  return true;
}

function reportIfTypeMismatch(context, returnType, usedFunction) {
  if (!returnType) {
    return;
  }

  if (
    !Array.isArray(usedFunction.typeArguments) ||
    usedFunction.typeArguments.length === 0
  ) {
    context.report({
      node: usedFunction.node,
      messageId: 'returnTypeAsFirstTypeArg',
      data: {
        functionName: usedFunction.name,
        returnType: returnType.typeName.name,
      },
      fix: (fixer) => {
        return fixer.replaceText(
          usedFunction.node.callee,
          `${usedFunction.name}<${returnType.typeName.name}>`
        );
      },
    });
    return;
  }

  if (!areTypesEqual(usedFunction.typeArguments[0], returnType)) {
    context.report({
      node: usedFunction.node,
      messageId: 'wrongFirstTypeArg',
      data: {
        functionName: usedFunction.name,
      },
    });
  }
}

function hasResponseDecoratorWithStatus(status, decorators) {
  for (const decorator of decorators) {
    if (
      !Array.isArray(decorator.arguments) ||
      decorator.arguments.length === 0
    ) {
      continue;
    }

    if (decorator.arguments[0].value === status) {
      return true;
    }
  }
}

function create(context) {
  return {
    'MethodDefinition FunctionExpression > BlockStatement CallExpression': (
      node
    ) => {
      recordUsedFunctions(node);
    },
    'MethodDefinition:exit': (node) => {
      const decorators = getCallExpressionDecoratorsInfo(node);

      const returnType = getMethodDefinitionReturnType(node);

      for (const usedFunction of usedFunctions) {
        if (usedFunction.name === 'this.errorResult') {
          reportIfTypeMismatch(context, returnType, usedFunction);

          if (
            !Array.isArray(usedFunction.arguments) ||
            usedFunction.arguments.length === 0
          ) {
            continue;
          }

          const responseDecorators = decorators['Response'];
          const status = usedFunction.arguments[0].value;

          if (
            !Array.isArray(responseDecorators) ||
            !hasResponseDecoratorWithStatus(status, responseDecorators)
          ) {
            context.report({
              node,
              messageId: 'noCorrectResponseDecorator',
              data: {
                functionName: usedFunction.name,
                status,
              },
            });
          }
        }

        if (usedFunction.name === 'this.noContentResult') {
          reportIfTypeMismatch(context, returnType, usedFunction);

          const responseDecorators = decorators['Response'];
          const NO_CONTENT_STATUS = 204;

          if (
            !Array.isArray(responseDecorators) ||
            !hasResponseDecoratorWithStatus(
              NO_CONTENT_STATUS,
              responseDecorators
            )
          ) {
            context.report({
              node,
              messageId: 'noCorrectResponseDecorator',
              data: {
                functionName: usedFunction.name,
                status: NO_CONTENT_STATUS,
              },
            });
          }
        }
      }

      usedFunctions = [];
    },
  };
}

export default {
  meta,
  create,
};
