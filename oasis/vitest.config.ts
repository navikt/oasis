import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    testTimeout: 50000,
    include: ["src/**/*.test.ts"],
  },
  define: {
    LIB_VERSION: JSON.stringify("x.x.x-tests"),
  },
});
