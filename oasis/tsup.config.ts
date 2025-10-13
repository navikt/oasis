import { defineConfig } from "tsup";

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
});
