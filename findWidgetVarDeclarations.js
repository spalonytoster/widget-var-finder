// jshint esversion: 6, node: true
const fs = require('fs');
const findWidgetVars = require('./findWidgetVars');
const regexes = findWidgetVars.regexes;

let options = {
  dir: process.argv[2],
  filters: [regexes.xhtmlRegex, regexes.jsRegex],
  regex: regexes.widgetVarRegex
};

let results = findWidgetVars.traverse(options);

fs.writeFileSync('results.json', JSON.stringify(results.results, null, 2));
console.log('files scanned: ' + JSON.stringify(results.filesScanned, null, 2));
