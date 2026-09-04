export default {
  "*.{ts,tsx}": () => "yarn tsc",
  "*.{js,ts,cjs,mjs,d.cts,d.mts,jsx,tsx,json,jsonc}": [
    "biome format --write --no-errors-on-unmatched",
    "biome lint --write --no-errors-on-unmatched",
  ],
};
