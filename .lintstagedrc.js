const path = require("path");

const buildEslintCommand = (filenames) => {
  const filtered = filenames.filter((f) => f.includes("example-app/"));
  return filtered.length > 0
    ? `next lint example-app --fix --file ${filtered
        .map((f) => path.relative(process.cwd(), f))
        .join(" --file ")}`
    : "echo wat";
};

module.exports = {
  "*.{js,jsx,ts,tsx}": [buildEslintCommand],
};
