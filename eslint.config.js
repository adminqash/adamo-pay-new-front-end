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
      // Code Style: Use 2 spaces for indentation
      "@stylistic/indent": ["error", 2],
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
      // JSX Newlines: Prevent blank lines between JSX elements
      "@stylistic/jsx-newline": ["error", { prevent: true }],
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
      // Import Order: Organize imports in a consistent order (builtin → external → internal)
      "import/order": [
        "error",
        {
          groups: [
            "builtin",   // Node.js built-in modules
            "external",  // npm packages
            "internal",  // Internal modules (@src/*, @app/*)
            ["parent", "sibling"], // Relative imports (../, ./)
            "index",     // Index imports (./)
            "object",    // Object imports
            "type",      // Type imports
          ],
          "newlines-between": "never", // No blank lines between import groups
          alphabetize: {
            order: "asc",              // Sort alphabetically A-Z
            caseInsensitive: true,     // Ignore case when sorting
          },
        },
      ],
      // Import Spacing: Require blank line after all imports
      "import/newline-after-import": "error",
      // Duplicate Imports: Prevent importing the same module multiple times
      "import/no-duplicates": "error",
    },
    settings: {
      "better-tailwindcss": {
        entryPoint: "src/index.css",
      },
    },
  },
]);
