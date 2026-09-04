import { defineConfig } from "tsdown";


export default defineConfig({
    sourcemap: true,
  entry: ["src/index.ts"],
  dts: true,
});
