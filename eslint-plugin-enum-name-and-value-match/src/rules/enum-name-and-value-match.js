/** @type {import('eslint').Rule.RuleModule} */
export default {
  meta: {
    messages: {
      enumNameAndValueMismatch:
        'Enum values are required to be equal to the enum key',
    },
    type: 'problem',
    hasSuggestions: true,
    docs: {
      description: 'Enforce enum values to be equal to the enum key.',
      recommended: true,
    },
    schema: [],
  },
  create: (context) => {
    return {
      TSEnumMember(node) {
        if (
          node.id.type !== 'Identifier' ||
          node.initializer.type !== 'Literal'
        ) {
          return;
        }

        const enumName = node.id.name;
        const enumValue = node.initializer.value;

        if (enumName !== enumValue) {
          context.report({
            node,
            messageId: 'enumNameAndValueMismatch',
            suggest: [
              {
                desc: 'Put the enum name as the enum value.',
                fix: (fixer) => {
                  return fixer.replaceText(node.initializer, `"${enumName}"`);
                },
              },
            ],
          });
        }
      },
    };
  },
};
