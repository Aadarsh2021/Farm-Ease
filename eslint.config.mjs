import { defineConfig } from "eslint/config";
import js from "@eslint/js";
import ts from "typescript-eslint";
import react from "eslint-plugin-react";

const eslintConfig = defineConfig([
  js.configs.recommended,
  ...ts.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    plugins: {
      react,
    },
    rules: {
      "react/react-in-jsx-scope": "off",
      "@next/next/no-img-element": "off", // Disable if still present
    },
  },
  {
    ignores: ["dist/**", "node_modules/**", "build/**"],
  },
]);

export default eslintConfig;
