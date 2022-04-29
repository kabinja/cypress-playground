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

function domRecorder(file) {
  const { filePath, outputPath } = file;
  console.log(filePath);

  const browserify = require("browserify")();
  browserify.add(filePath);

  var content = "";
  browserify
    .transform("babelify", {
      presets: ["@babel/preset-env", {"modules": "cjs"}],
    })
    .bundle()
    .on("data", function (data) {
      content += data.toString();
    })
    .on("end", () => {
      const instrumented = instrument(content);
      console.log(content);
      fs.writeFileSync(outputPath, instrumented, "utf8");
    });

  console.log(outputPath);

  return outputPath;
}

module.exports = domRecorder;
