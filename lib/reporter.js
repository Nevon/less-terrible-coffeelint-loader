'use strict';
var chalk = require( 'chalk' );
var table = require( 'text-table' );

module.exports = function(errors, emitErrors) {
  var emitter = emitErrors ? this.emitError : this.emitWarning;
  var errorCount = errors.filter(function(error) { return (error.level === 'error'); }).length;
  var warningCount = errors.filter(function(error) { return (error.level === 'warning'); }).length;

  var report = table(errors.map(function(error) {
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

  if (errors.length > 0) {
    report = report +
      '\n\n' +
      chalk.yellow([
        '✖ ',
        errors.length,
        ' problems',
        ' (',
        errorCount,
        ' errors, ',
        warningCount,
        ' warnings)'
      ].join(''));
  }

  emitter(report);

};