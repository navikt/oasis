const path = require("path");

const buildEslintCommand = (filenames) =>
  filenames.lengt > 0
    ? `next lint example-app --fix --file ${filenames
        .filter((f) => f.includes("example-app/"))
        .map((f) => path.relative(process.cwd(), f))
        .join(" --file ")}`
    : "";

module.exports = {
  "*.{js,jsx,ts,tsx}": [buildEslintCommand],
};
