/** @type {import('eslint').Rule.RuleModule} */
const meta = {
  messages: {
    returnTypeAsFirstTypeArg:
      "'{{ functionName }}' should have '{{ returnType }}' as first type argument",
    wrongFirstTypeArg:
      "'{{ functionName }}' first type argument should be '{{ returnType }}' not '{{ wrongFirstArg }}'",
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

function create(context) {
  return {
    'MethodDefinition FunctionExpression > BlockStatement CallExpression': (
      node
    ) => {
      const functionName = getFullFunctionName(node.callee);

      usedFunctions.push({
        name: functionName,
        arguments: node.arguments,
        typeArguments: node.typeArguments?.params,
        node,
      });
    },
    'MethodDefinition:exit': (node) => {
      const decorators = getCallExpressionDecoratorsInfo(node);

      const returnType = getMethodDefinitionReturnType(node);

      for (const usedFunction of usedFunctions) {
        if (usedFunction.name === 'this.errorResult') {
          if (returnType) {
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
            } else if (
              usedFunction.typeArguments[0].typeName.name !==
              returnType.typeName.name
            ) {
              context.report({
                node: usedFunction.node,
                messageId: 'wrongFirstTypeArg',
                data: {
                  functionName: usedFunction.name,
                  returnType: returnType.typeName.name,
                  wrongFirstArg: usedFunction.typeArguments[0].typeName.name,
                },
              });
            } else {
              // everything is good
            }
          }

          const responseDecorators = decorators['Response'];
          if (!Array.isArray(responseDecorators)) {
            context.report({
              node,
              messageId: 'noCorrectResponseDecorator',
              data: {
                functionName: usedFunction.name,
                status: usedFunction.arguments[0].value,
              },
            });
            continue;
          }

          let hasCorrespondingResponseDecorator = false;

          for (const responseDecorator of responseDecorators) {
            if (!Array.isArray(responseDecorator.arguments)) {
              // TODO: report? Decorator Response should have first arg
              context.report({
                node,
                messageId: 'noCorrectResponseDecorator',
                data: {
                  functionName: usedFunction.name,
                  status: usedFunction.arguments[0].value,
                },
              });
              continue;
            }

            if (!Array.isArray(usedFunction.arguments)) {
              // TODO: what to do if the usedFunction doesn't have arguments? its not valid typescript
              continue;
            }

            const firstArg = responseDecorator.arguments[0];

            if (firstArg.value === usedFunction.arguments[0].value) {
              // its the right response we good
              hasCorrespondingResponseDecorator = true;
              break;
            }
          }

          if (!hasCorrespondingResponseDecorator) {
            context.report({
              node,
              messageId: 'noCorrectResponseDecorator',
              data: {
                functionName: usedFunction.name,
                status: usedFunction.arguments[0].value,
              },
            });
          }
        }

        if (usedFunction.name === 'this.noContentResult') {
          if (returnType) {
            if (
              !Array.isArray(usedFunction.typeArguments) ||
              usedFunction.typeArguments.length === 0
            ) {
              // report [UsedFunction] should have [ReturnType] as first Type Argument.
            } else if (
              usedFunction.typeArguments[0].typeName.name !==
              returnType.typeName.name
            ) {
              // report [UsedFunction]'s first Type Argument should be [ReturnType] not [TypeArgumentName]
            } else {
              // everything is good
            }
          }

          const responseDecorators = decorators['Response'];
          if (!Array.isArray(responseDecorators)) {
            //report You must have [ResponseExample]
          }

          let hasCorrespondingResponseDecorator = false;

          for (const responseDecorator of responseDecorators) {
            if (!Array.isArray(responseDecorator.arguments)) {
              // TODO: report? Decorator Response should have first arg
              continue;
            }

            if (usedFunction.arguments[0].value === 204) {
              // its the right response we good
              hasCorrespondingResponseDecorator = true;
              break;
            }
          }

          if (!hasCorrespondingResponseDecorator) {
            // report no Response decorator with status [Status]
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
