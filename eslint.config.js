import js from '@eslint/js';
import tseslint from 'typescript-eslint';

// ESLint 9 flat config — see https://eslint.org/docs/latest/use/configure/configuration-files
export default tseslint.config(
  { ignores: ['**/dist/**', '**/node_modules/**', '**/build/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      // Allow intentionally-unused args/vars when prefixed with `_`
      // (e.g. Express error middleware's required 4th `next` param).
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
);
