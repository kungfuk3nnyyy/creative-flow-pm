/**
 * Custom ESLint rule: no-emoji
 *
 * Disallows emoji characters in source code, strings, comments,
 * template literals, and JSX text. This project uses lucide-react
 * icons and plain text instead of emojis.
 *
 * Usage in .eslintrc.js:
 *   const noEmojiRule = require('./.eslintrc.emoji.js');
 *   module.exports = {
 *     plugins: ['local'],
 *     rules: { 'local/no-emoji': 'error' },
 *   };
 *
 * Or integrate directly into your ESLint flat config.
 */

// Regex matching most common emoji ranges (Unicode emoji blocks)
const EMOJI_REGEX =
  /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{FE00}-\u{FE0F}]|[\u{1F900}-\u{1F9FF}]|[\u{1FA00}-\u{1FA6F}]|[\u{1FA70}-\u{1FAFF}]|[\u{200D}]|[\u{20E3}]|[\u{E0020}-\u{E007F}]/u;

const EMOJI_REGEX_GLOBAL =
  /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{FE00}-\u{FE0F}]|[\u{1F900}-\u{1F9FF}]|[\u{1FA00}-\u{1FA6F}]|[\u{1FA70}-\u{1FAFF}]|[\u{200D}]|[\u{20E3}]|[\u{E0020}-\u{E007F}]/gu;

/** @type {import('eslint').Rule.RuleModule} */
const noEmojiRule = {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow emoji characters in source code",
      category: "Stylistic Issues",
      recommended: true,
    },
    messages: {
      noEmoji:
        "Emoji characters are not allowed. Use lucide-react icons or plain text instead.",
    },
    schema: [],
  },
  create(context) {
    function checkForEmoji(node, value) {
      if (typeof value !== "string") return;
      if (EMOJI_REGEX.test(value)) {
        context.report({
          node,
          messageId: "noEmoji",
        });
      }
    }

    return {
      // String literals
      Literal(node) {
        if (typeof node.value === "string") {
          checkForEmoji(node, node.value);
        }
      },

      // Template literal parts
      TemplateLiteral(node) {
        node.quasis.forEach((quasi) => {
          checkForEmoji(quasi, quasi.value.raw);
        });
      },

      // JSX text content
      JSXText(node) {
        checkForEmoji(node, node.value);
      },

      // Comments (both line and block)
      Program() {
        const sourceCode = context.getSourceCode
          ? context.getSourceCode()
          : context.sourceCode;
        const comments = sourceCode.getAllComments();
        comments.forEach((comment) => {
          if (EMOJI_REGEX.test(comment.value)) {
            context.report({
              loc: comment.loc,
              messageId: "noEmoji",
            });
          }
        });
      },
    };
  },
};

module.exports = noEmojiRule;
