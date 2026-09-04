import { defineConfig } from "tsdown";

import pkgJson from "./package.json" with { type : "json" };

export default defineConfig({
  sourcemap: true,
  entry: ["src/index.ts"],
  define: {
    LIB_VERSION: JSON.stringify(pkgJson.version),
  },
  deps: {
    neverBundle: ["node:http"],
  },
});
