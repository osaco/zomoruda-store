import { defineConfig } from "vitest/config";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(projectRoot, "src"),
      "server-only": path.resolve(projectRoot, "tests/server-only-stub.ts"),
    },
  },
  test: { include: ["tests/**/*.test.ts"], server: { deps: { inline: [/next/] } }, environment: "node" },
});
