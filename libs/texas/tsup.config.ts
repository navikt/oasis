import { defineConfig } from "tsup";

import { sharedConfig } from "../tsup.common";

export default defineConfig({
  ...sharedConfig,
  entry: ["src/index.ts"],
  dts: {
    resolve: true,
    entry: "./src/index.ts",
  },
});
