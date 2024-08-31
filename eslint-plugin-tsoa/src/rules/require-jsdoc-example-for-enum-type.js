import { ESLintUtils } from '@typescript-eslint/utils';
import { getJSDocComment, parseComment } from '@es-joy/jsdoccomment';
import ts from 'typescript';

/** @type {import('eslint').Rule.RuleModule} */
export default {
  meta: {
    messages: {
      exampleIsMissing: 'Missing JSDoc @example declaration',
      exampleDescriptionIsMissing: 'Missing JSDoc @example description.',
      exampleIsForbidden: 'Using JSDoc @example on complex types is forbidden.',
      exampleValueIsNotValid: 'JSDoc @example contains invalid enum value.',
    },
    type: 'problem',
    docs: {
      description:
        'Enforce correct usage of JSDoc @example declaration for enum properties and ban other complex types from having @example declaration.',
      recommended: true,
    },
    schema: [],
  },
  create: (context) => {
    const services = ESLintUtils.getParserServices(context);
    const sourceCode = context.getSourceCode();

    function isTypeEnum(type) {
      return type.symbol?.flags & ts.SymbolFlags.Enum;
    }

    return {
      TSPropertySignature(node) {
        if (node.typeAnnotation.typeAnnotation.type !== 'TSTypeReference') {
          return;
        }

        const propertyType = services.getTypeAtLocation(node);

        const jsdocNode = getJSDocComment(sourceCode, node, {
          maxLines: 1,
          minLines: 0,
        });

        if (!jsdocNode) {
          return;
        }

        const jsdoc = parseComment(jsdocNode);

        const targetTagName = 'example';

        const propertyExamples = jsdoc.tags.filter(({ tag }) => {
          return tag === targetTagName;
        });

        if (!isTypeEnum(propertyType)) {
          if (propertyExamples.length > 0) {
            context.report({
              node,
              messageId: 'exampleIsForbidden',
            });
          }
          return;
        }

        if (propertyExamples.length === 0) {
          context.report({
            node,
            messageId: 'exampleIsMissing',
          });
          return;
        }

        const enumValues = propertyType.symbol.exports;

        for (const example of propertyExamples) {
          const description = example.description.trim();

          if (description.length === 0) {
            context.report({
              node,
              messageId: 'exampleDescriptionIsMissing',
            });
            continue;
          }

          if (!description.startsWith('"') || !description.endsWith('"')) {
            continue;
          }

          const exampleEnumValue = description.substring(
            1,
            description.length - 1
          );

          if (!enumValues.has(exampleEnumValue)) {
            context.report({
              node,
              messageId: 'exampleValueIsNotValid',
            });
          }
        }
      },
    };
  },
};
