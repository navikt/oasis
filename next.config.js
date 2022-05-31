const { generateKeyPair } = require("jose");

/** @type {import("next").NextConfig} */
const nextConfig = async () => ({
  serverRuntimeConfig: {
    ...(process.env.GENERATE_DEV_JWK == "enabled" && {
      key: await generateKeyPair("RS256"),
    }),
  },
  reactStrictMode: true,
  output: "standalone",
});

module.exports = nextConfig;
