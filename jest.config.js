module.exports = {
  globalSetup: "<rootDir>/jest.env.ts",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  testPathIgnorePatterns: ["<rootDir>/.next/", "<rootDir>/node_modules/"],
  verbose: true,
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": ["babel-jest", { presets: ["next/babel"] }],
  },
  moduleNameMapper: {
    "^jose/(.*)$": "<rootDir>/node_modules/jose/dist/node/cjs/$1",
  },
  testPathIgnorePatterns: ["/node_modules/", "__utils__"],
  coveragePathIgnorePatterns: ["/node_modules/", "__utils__"],
  testEnvironment: "node",
  collectCoverage: false,
  transformIgnorePatterns: [
    "/node_modules/",
    "^.+\\.module\\.(css|sass|scss)$",
  ],
};
