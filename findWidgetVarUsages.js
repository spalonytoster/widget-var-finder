// jshint esversion: 6, node: true
const fs = require('fs');
const findWidgetVars = require('./findWidgetVars');
const regexes = findWidgetVars.regexes;
const input = JSON.parse(fs.readFileSync(process.argv[3], 'utf-8'));

let results = [];

if (input) {
  input.forEach((occurencesInAFile) => {
    occurencesInAFile.widgetVars.forEach((widgetVar) => {
      // let regex = new RegExp(`[^\.](${widgetVar}\\..{1,30})`, 'g');
      let regex = new RegExp(`[^\.](${widgetVar}\\.((?!.*hide)(?!.*show)).{1,30})`, 'g');
      // let regex = new RegExp(`[^\.](${widgetVar}\\.(hide|show).{1,30})`, 'g');
      let options = {
        dir: process.argv[2],
        filters: [regexes.xhtmlRegex, regexes.jsRegex],
        regex: regex
      };

      console.log('looking for occurences of: ' + widgetVar);

      findWidgetVars.reset();
      let occurences = findWidgetVars.traverse(options);
      if (occurences.results.length === 0) {
        return;
      }

      results.push({
        widgetVar: widgetVar,
        occurences: occurences.results
      });
    });
  });
}

fs.writeFileSync('usages_results_except_show_hide.json', JSON.stringify(results, null, 2));
