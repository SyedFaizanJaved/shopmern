import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom', // simulate a browser DOM for component tests
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
  },
});
