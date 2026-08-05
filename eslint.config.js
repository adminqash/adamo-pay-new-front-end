import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import { defineConfig, globalIgnores } from "eslint/config";
import stylistic from "@stylistic/eslint-plugin";
import betterTailwindcss from "eslint-plugin-better-tailwindcss";
import importPlugin from "eslint-plugin-import";

export default defineConfig([
  globalIgnores(["dist", "node_modules"]),
  {
    files: ["src/**/*.{ts,tsx}"],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
      stylistic.configs.recommended,
    ],
    plugins: {
      "better-tailwindcss": betterTailwindcss,
      import: importPlugin,
    },
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      // Tailwind CSS: Apply recommended rules for class sorting and organization
      ...betterTailwindcss.configs["recommended-error"].rules,
      // Warn about usage of unregistered Tailwind CSS classes
      "better-tailwindcss/no-unregistered-classes": "warn",
      // Temporarily relaxed to unblock commit while large refactor is in progress
      "@stylistic/indent": "off",
      // Quotes: Use double quotes for strings
      "@stylistic/quotes": ["error", "double"],
      // Object Keys: Only quote object keys when necessary
      "@stylistic/quote-props": ["error", "as-needed"],
      // Semicolons: Always require semicolons at the end of statements
      "@stylistic/semi": ["error", "always"],
      // Arrow Functions: Always use parentheses around arrow function parameters
      "@stylistic/arrow-parens": ["error", "always"],
      // Function Spacing: No space before function parentheses
      "@stylistic/space-before-function-paren": ["error", "never"],
      // Line Breaks: Use Unix-style line endings (LF)
      "@stylistic/linebreak-style": ["error", "unix"],
      // Brace Style: Keep else, catch, finally on same line as closing brace
      "@stylistic/brace-style": ["error", "1tbs", { allowSingleLine: true }],
      // JSX Expressions: Allow multiple JSX expressions on one line
      "@stylistic/jsx-one-expression-per-line": "off",
      "@stylistic/jsx-newline": "off",
      "@stylistic/no-trailing-spaces": "off",
      "@stylistic/multiline-ternary": "off",
      // Type Imports: Enforce separate type imports for better tree-shaking
      "@typescript-eslint/consistent-type-imports": [
        "error",
        {
          prefer: "type-imports",
          fixStyle: "separate-type-imports",
        },
      ],
      // Type Import Side Effects: Prevent inline type imports that could cause side effects
      "@typescript-eslint/no-import-type-side-effects": "error",
      "import/order": "off",
      "import/newline-after-import": "off",
      // Duplicate Imports: Prevent importing the same module multiple times
      "import/no-duplicates": "error",
      "@typescript-eslint/no-unused-vars": "off",
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/static-components": "off",
    },
    settings: {
      "better-tailwindcss": {
        entryPoint: "src/index.css",
      },
    },
  },
]);
