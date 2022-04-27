const fs = require("fs");
const { parseScript } = require("shift-parser");

function domRecorder(file) {
  const { filePath, outputPath, shouldWatch } = file;
  console.log({ filePath, outputPath, shouldWatch });
  const ast = parseScript(filePath);
  fs.writeFileSync(outputPath, "", "utf8");
  return outputPath;
}

module.exports = domRecorder;