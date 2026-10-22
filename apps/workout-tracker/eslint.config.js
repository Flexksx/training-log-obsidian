import { defineConfig } from "eslint/config";
import svelte from "eslint-plugin-svelte";
import typescript from "typescript-eslint";

export default defineConfig({ ignores: ["dist"] }, svelte.configs.recommended, {
  files: ["**/*.svelte", "**/*.svelte.ts"],
  languageOptions: { parserOptions: { parser: typescript.parser } },
});
