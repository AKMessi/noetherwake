import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";
export default defineConfig({
  resolve: {
    alias: {
      "@noetherwake/engine": fileURLToPath(
        new URL("./packages/engine/src/index.ts", import.meta.url),
      ),
    },
  },
  test: {
    include: ["packages/engine/test/**/*.test.ts", "tests/unit/**/*.test.ts"],
    testTimeout: 30000,
  },
});
