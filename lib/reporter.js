'use strict';
var chalk = require( 'chalk' );
var table = require( 'text-table' );

module.exports = function(errors) {
  return table(errors.map(function(error) {
    var line = [
      '',
      chalk.gray(error.lineNumber),
      chalk.yellow(error.level),
      error.message
    ];

    if (error.context) {
      line.push(chalk.grey(error.context));
    }

    return line;
  }));
};