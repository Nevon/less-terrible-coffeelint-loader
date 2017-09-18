'use strict';
var chalk = require( 'chalk' );
var table = require( 'text-table' );

module.exports = function(errors) {
  var errorCount = errors.filter(function(error) { return (error.level === 'error'); }).length;
  var warningCount = errors.filter(function(error) { return (error.level === 'warn'); }).length;
  var emitter = errorCount ? this.emitError : this.emitWarning;

  var report = table(errors.map(function(error) {
    var line = [
      '',
      chalk.reset.grey(error.lineNumber),
      error.level === 'error' ? chalk.red('error') : chalk.yellow('warning'),
      error.message,
      chalk.dim(error.name || "")
    ];

    if (error.context) {
       line.push(chalk.grey('\'' + error.context + '\''));
    }

    return line;
  }));

  if (errors.length > 0) {
    report = '\n' +
      chalk.underline[errorCount ? "red" : "yellow"](this.resourcePath) +
      '\n' +
      report +
      '\n\n' +
      chalk.bold[errorCount ? "red" : "yellow"]([
        '✖ ',
        errors.length,
        ' problems',
        ' (',
        errorCount,
        ' error' +
        (errorCount !== 1 ? 's' : '') +
        ', ',
        warningCount,
        ' warning' +
        (warningCount !== 1 ? 's' : '') +
        ')\n'
      ].join(''));
  }

  emitter(new Error(report));
};
