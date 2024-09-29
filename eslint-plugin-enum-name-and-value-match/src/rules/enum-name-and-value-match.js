/** @type {import('eslint').Rule.RuleModule} */
export default {
  meta: {
    messages: {
      enumNameAndValueMismatch:
        'Enum values are required to be the same as the enum keys',
    },
    type: 'problem',
    hasSuggestions: true,
    docs: {
      description: 'Enforce enum values to equal enum keys.',
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
                desc: 'Set the enum value as the enum name.',
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
