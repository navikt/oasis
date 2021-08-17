module.exports = {
 //   globalSetup: "<rootDir>/jest.env.js",
 //   setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
    testPathIgnorePatterns: ["<rootDir>/.next/", "<rootDir>/node_modules/"],
    transformIgnorePatterns: ["/node_modules/(?!@navikt/ds-icons).+\\.js$"],
    verbose: true,
};