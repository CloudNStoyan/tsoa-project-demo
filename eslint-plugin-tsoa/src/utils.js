const HTTP_METHOD_DECORATOR_NAMES = [
  'Options',
  'Get',
  'Post',
  'Put',
  'Patch',
  'Delete',
  'Head',
];

export function hasHttpMethodDecorator(node) {
  for (const httpMethodDecoratorName of HTTP_METHOD_DECORATOR_NAMES) {
    if (
      hasDecoratorWithName({ node, decoratorName: httpMethodDecoratorName })
    ) {
      return true;
    }
  }

  return false;
}

/** @param {import('eslint').Rule.Node} node */
export function getFullFunctionName(node) {
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

/**
 * @param {{node: import('eslint').Rule.Node, decoratorName: string}} options
 * @returns {boolean}
 */
export function hasDecoratorWithName({ node, decoratorName }) {
  if (!Array.isArray(node?.decorators)) {
    return false;
  }
  for (const decorator of node.decorators) {
    if (decorator?.type !== 'Decorator') {
      continue;
    }

    if (
      decorator.expression.type === 'Identifier' &&
      decorator.expression.name === decoratorName
    ) {
      return true;
    }

    if (
      decorator.expression.type === 'CallExpression' &&
      decorator.expression.callee?.type === 'Identifier' &&
      decorator.expression.callee.name === decoratorName
    ) {
      return true;
    }
  }

  return false;
}

/**
 * @param {{node: import('eslint').Rule.Node, decorators: unknown[]}} options
 * @returns {boolean}
 */
export function hasResponseDecoratorWithStatus({ status, decorators }) {
  for (const decorator of decorators) {
    if (decorator.expression.type !== 'CallExpression') {
      continue;
    }

    const decoratorArguments = decorator.expression.arguments;

    if (!Array.isArray(decoratorArguments) || decoratorArguments.length === 0) {
      continue;
    }

    if (decoratorArguments[0].value === status) {
      return true;
    }
  }

  return false;
}

/**
 * @param {{node: import('eslint').Rule.Node, decoratorName: string}} options
 * @returns {unknown[]}
 */
export function getAllDecoratorsWithName({ node, decoratorName }) {
  if (!Array.isArray(node?.decorators)) {
    return [];
  }

  const decorators = [];

  for (const decorator of node.decorators) {
    if (
      decorator?.type !== 'Decorator' ||
      decorator.expression.type !== 'CallExpression' ||
      decorator.expression.callee?.type !== 'Identifier'
    ) {
      continue;
    }

    if (decorator.expression.callee.name !== decoratorName) {
      continue;
    }

    decorators.push(decorator);
  }

  return decorators;
}
