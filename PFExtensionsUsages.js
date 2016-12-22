// jshint esversion: 6, node: true
const fs = require('fs');
const findOccurences = require('./findWidgetVars');
const regexes = findOccurences.regexes;
const components = ['inputNumber', 'timeline', 'knob', 'keyFilter', 'importantConstants', 'importEnum'];

let results = [];

components.forEach((component) => {
  let regex = new RegExp(`(<pe:\\b${component}\\b.*\/>)`, 'g');

  let options = {
    dir: process.argv[2],
    filters: [regexes.xhtmlRegex],
    regex: regex
  };

  console.log('looking for occurences of: ' + component);

  findOccurences.reset();
  let occurences = findOccurences.traverse(options);
  if (occurences.results.length === 0) {
    return;
  }

  results.push({
    component: component,
    occurences: occurences.results
  });
});

fs.writeFileSync('components_usages.json', JSON.stringify(results, null, 2));
