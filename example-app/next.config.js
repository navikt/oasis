const { generateKeyPair } = require("jose");

/** @type {import("next").NextConfig} */
const nextConfig = async () => ({
  experimental: {
    instrumentationHook: process.env.NODE_ENV === "development",
  },
  reactStrictMode: true,
  output: "standalone",
});

module.exports = nextConfig;
