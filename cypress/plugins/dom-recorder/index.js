const fs = require("fs");

function getContent(filePath) {
  return fs.readFileSync(filePath, { encoding: "utf8", flag: "r" });
}

function traverseAst(ast, locations) {
  const { traverse } = require("shift-traverser");

  traverse(ast, {
    enter(node) {
      if (node.type == "CallExpression") {
        if (
          node.callee.type == "IdentifierExpression" &&
          node.callee.name == "describe"
        ) {
          console.log(`test name: ${node.arguments[0].value}`);
        } else if (
          node.callee.type == "StaticMemberExpression" &&
          node.callee.property == "get"
        ) {
          console.log(`Selectors: ${node.arguments[0].value}`);
          console.log(JSON.stringify(node));
        }
      }
    },
  });
}

function instrument(content) {
  const {
    parseScriptWithLocation,
    parseModuleWithLocation,
  } = require("shift-parser");

  try {
    const { tree, locations } = parseScriptWithLocation(content);
    traverseAst(tree, locations);
    return content;
  } catch (err) {
    const { tree, locations } = parseModuleWithLocation(content);
    traverseAst(tree, locations);
    return content;
  }
}

async function domRecorder(file) {
  const { outputPath } = file;

  const browserify = require('@cypress/browserify-preprocessor')();
  await browserify(file);
  
  const content = getContent(outputPath);
  const instrumented = instrument(content);
  fs.writeFileSync(outputPath, instrumented, "utf8");

  return outputPath;
}

module.exports = domRecorder;
