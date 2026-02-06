import { FlatCompat } from "@eslint/eslintrc";
import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const compat = new FlatCompat({ baseDirectory: __dirname });

const require = createRequire(import.meta.url);
const noEmojiRule = require("./.eslintrc.emoji.js");

const nextConfigs = compat.extends("next/core-web-vitals");

// Find the config object that has the @typescript-eslint plugin
// and add our rule override to it so they share the same plugin scope.
for (const config of nextConfigs) {
  if (config.plugins?.["@typescript-eslint"]) {
    config.rules = {
      ...config.rules,
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_" },
      ],
    };
    break;
  }
}

export default [
  ...nextConfigs,
  {
    rules: {
      "no-console": ["warn", { allow: ["warn", "error"] }],
    },
  },
  {
    plugins: {
      local: {
        rules: {
          "no-emoji": noEmojiRule,
        },
      },
    },
    rules: {
      "local/no-emoji": "error",
    },
  },
];
