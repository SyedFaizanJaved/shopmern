import js from '@eslint/js';
import tseslint from 'typescript-eslint';

// ESLint 9 flat config — see https://eslint.org/docs/latest/use/configure/configuration-files
export default tseslint.config(
  { ignores: ['**/dist/**', '**/node_modules/**', '**/build/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
);
