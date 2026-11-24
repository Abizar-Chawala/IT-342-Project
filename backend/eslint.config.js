import js from "@eslint/js";
import eslintPluginPrettier from "eslint-plugin-prettier/recommended";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["node_modules", "drizzle/migrations"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,mjs}"],
    languageOptions: { ecmaVersion: 2022, globals: globals.node },
    rules: { "@typescript-eslint/no-unused-vars": "off" },
  },
  eslintPluginPrettier,
);
