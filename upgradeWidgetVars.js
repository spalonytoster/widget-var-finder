// jshint esversion: 6, node: true
const fs = require('fs');
const path = require('path');
const findWidgetVars = require('./findWidgetVars');
const regexes = findWidgetVars.regexes;
const input = JSON.parse(fs.readFileSync(process.argv[3], 'utf-8'));

let results = [];

function surroundWithPFCall(input) {
  return `PF('${input}').`;
}

function evaluateFileFunction(filePath, filename, regex, replacement) {
  let file = fs.readFileSync(filePath, 'utf-8');

  let matches = file.search(regex) >= 0;
  if (!matches) {
    return false;
  }

  console.log('updated: ' + filePath);

  let replaced = file.replace(regex, replacement);
  fs.writeFileSync(filePath, replaced);
}

if (input) {
  input.forEach((occurencesInAFile) => {
    occurencesInAFile.widgetVars.forEach((widgetVar) => {
      let regex = new RegExp(`(${widgetVar}\\.)`, 'g');
      let options = {
        dir: process.argv[2],
        filters: [regexes.xhtmlRegex, regexes.jsRegex],
        regex: regex,
        evaluateFile: {
          evaluator: evaluateFileFunction,
          replacement: surroundWithPFCall(widgetVar)
        }
      };

      findWidgetVars.reset();
      let occurences = findWidgetVars.traverse(options);
      if (occurences.results.length === 0) {
        return;
      }
    });
  });
}
