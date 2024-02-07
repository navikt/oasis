import "dotenv/config";
import type { Config } from "@jest/types";

const customJestConfig: Config.InitialOptions = {
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleDirectories: ["node_modules", "<rootDir>/"],
  testPathIgnorePatterns: ["<rootDir>/__tests__/__utils__"],
  testEnvironment: "jest-environment-node",
};

export default customJestConfig;
