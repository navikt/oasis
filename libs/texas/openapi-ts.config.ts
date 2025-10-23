import { defineConfig } from "@hey-api/openapi-ts";

export default defineConfig({
  input: "https://raw.githubusercontent.com/nais/texas/refs/heads/master/doc/openapi-spec.json",
  output: {
    path: "src",
    indexFile: false,
    clean: false,
  },
  plugins: ["@hey-api/typescript"],
});
