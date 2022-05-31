const nextJest = require("next/jest");
import type { Config } from "@jest/types";

const createJestConfig = nextJest({
  dir: "./"
});

const customJestConfig: Config.InitialOptions = {
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleDirectories: ["node_modules", "<rootDir>/"],
  testPathIgnorePatterns: ["<rootDir>/__tests__/__utils__"],
  testEnvironment: "jest-environment-node"
};

export default createJestConfig(customJestConfig);
