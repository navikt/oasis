import { defineConfig } from "tsup";

import pkgJson from "./package.json";

export default defineConfig({
  entry: ["src/index.ts"],
  dts: {
    resolve: true,
    entry: "./src/index.ts",
  },
  format: "esm",
  sourcemap: true,
  clean: true,
  metafile: true,
  external: ["node:http"],
  define: {
    LIB_VERSION: JSON.stringify(pkgJson.version),
  },
});
