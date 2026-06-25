import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // All test files share ONE MongoDB (shopmern_test). Running them in
    // parallel lets one file's deleteMany() cleanup race against another file's
    // assertions → flaky failures. Serialize files to keep tests deterministic.
    fileParallelism: false,
  },
});
