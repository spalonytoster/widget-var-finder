// jshint esversion: 6, node: true
const fs = require('fs');
const path = require('path');

const regexes = {
  xhtmlRegex: /^.*\.xhtml$/, // matches exactly *.xhtml
  jsRegex: /^.*\.js$/,       // matches exactly *.js
  widgetVarRegex: /widgetVar="([a-z_{}#]*)"/gi
};

const excludes = [
  'target',
  '.svn',
  '.classpath'
];

let results = [];
let filesScanned = {
  all: 0,
  matchingFileTypes: 0,
  matchingRegex: 0
};

function reset() {
  results = [];
  filesScanned = {
    all: 0,
    matchingFileTypes: 0,
    matchingRegex: 0
  };
}

function fileMatchesFilters(filename, filters) {
  if (filters.length === 0) return true;
  let result = false;
  filters.forEach((regex) => {
    if (filename.match(regex)) {
      result = true;
    }
  });
  return result;
}

function shouldBeOmitted(filename) {
  if (excludes.length === 0) return false;
  let result = false;
  excludes.forEach((exclude) => {
    let regex = new RegExp(exclude);
    if (regex.test(filename)) {
      result = true;
    }
  });
  return result;
}

function findRegexInFile(filePath, filename, regex) {
  let file = fs.readFileSync(filePath, 'utf-8');
  let widgetVars = [];
  let lines = [];
  let result = null;

  if (!regex) {
    return undefined;
  }

  do {
    result = regex.exec(file);
    if (result !== null) {
      widgetVars.push(result[1]);
      lines.push(determineLineFromIndex(file, result.index));
    }
  } while (result !== null);

  if (widgetVars.length > 0) {
    return {
      file: filename,
      path: filePath,
      widgetVars: widgetVars,
      lines: lines
    };
  }
  return undefined;
}

function determineLineFromIndex(file, index) {
  let line = 1;
  for (let i = 0; i < index; i++) {
    if (file[i] === '\n') {
      line++;
    }
  }
  return line;
}

function traverse(options) {
  fs.readdirSync(options.dir).forEach((file) => {
    let filePath = path.resolve(options.dir, file);
    let isDirectory = fs.statSync(filePath).isDirectory();

    if (shouldBeOmitted(file)) {
      return;
    }

    if (isDirectory) {
      traverse({
        dir: filePath,
        filters: options.filters,
        regex: options.regex,
        evaluateFile: options.evaluateFile
      });
    }
    else if (fileMatchesFilters(file, options.filters)) {
      let result;
      if (options.evaluateFile) {
        let evaluator = options.evaluateFile.evaluator;
        let replacement = options.evaluateFile.replacement;
        result = evaluator(filePath, file, options.regex, replacement);
      }
      else {
        result = findRegexInFile(filePath, file, options.regex);
      }
      if (result) {
        results.push(result);
        filesScanned.all++;
        filesScanned.matchingFileTypes++;
        filesScanned.matchingRegex++;
      }
      filesScanned.all++;
      filesScanned.matchingFileTypes++;
    }
    filesScanned.all++;
  });
  return {
    results: results,
    filesScanned: filesScanned
  };
}

module.exports = {
  traverse: traverse,
  regexes: regexes,
  reset: reset
};
