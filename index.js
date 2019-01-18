'use strict';

var fs              = require('fs');
var path            = require('path');
var strip           = require('strip-json-comments');
var utils           = require('loader-utils');
var RcFinder        = require('rcfinder');
var linter          = require('coffeelint').lint;
var defaultReporter = require('./lib/reporter');

var extend = function (obj) {
  var source, prop, i, l;
  for (i = 1, l = arguments.length; i < l; i += 1) {
    source = arguments[i];
    for (prop in source) {
      if (hasOwnProperty.call(source, prop)) {
        obj[prop] = source[prop];
      }
    }
  }
  return obj;
};

var rcFinder1 = new RcFinder('.coffeelint.json', {
  loader: function (rcpath) {
    return rcpath;
  }
});

var rcFinder2 = new RcFinder('coffeelint.json', {
  loader: function (rcpath) {
    return rcpath;
  }
});

var loadConfigSync = function () {
  var folder = path.dirname(this.resourcePath);
  var rcFinders = [rcFinder1, rcFinder2];
  var rcpath;
  while (rcFinders.length && typeof rcpath !== 'string') {
    rcpath = rcFinders.shift().find(folder);
  }
  if (typeof rcpath !== 'string') {
    // No .coffeelint.json found.
    return {};
  }

  this.addDependency(rcpath);
  var file = fs.readFileSync(rcpath, 'utf8');
  return JSON.parse(strip(file));
};

var loadConfigAsync = function (callback) {
  var folder = path.dirname(this.resourcePath);
  var rcFinders = [rcFinder1, rcFinder2];
  var rcFinderCallback = function (err, rcpath) {
    if (typeof rcpath !== 'string') {
      // No .coffeelint.json found.
      if (rcFinders.length) {
        return rcFinders.shift().find(folder, rcFinderCallback);
      }
      return callback(null, {});
    }

    this.addDependency(rcpath);
    fs.readFile(rcpath, 'utf8', function (err, file) {
      var options;

      if (!err) {
        try {
          options = JSON.parse(strip(file));
        }
        catch (e) {
          err = e;
        }
      }
      callback(err, options);
    });
  }.bind(this);
  rcFinders.shift().find(folder, rcFinderCallback);
};


var checkSource = function (source, config) {
  // Copy options to own object.
  var options = (this.options && this.options.coffeelint) || {};
  extend(config, options);

  // Copy query to own object.
  var query = utils.parseQuery(this.query);
  extend(config, query);

  // Move flags.
  var failOnHint = config.failOnHint;
  delete config.failOnHint;

  // Custom reporter.
  var reporter = (config.reporter) ? config.reporter : defaultReporter;
  delete config.reporter;

  var errors = linter(source, config);
  if (errors.length > 0) {
    reporter.call(this, errors);

    if (failOnHint && errors.length > 0) {
      throw new Error('Module failed because of coffeelint error.');
    }
  }
};


module.exports = function (source) {
  this.cacheable();

  var callback = this.async();

  if (!callback) {
    var config = loadConfigSync.call(this);
    checkSource.call(this, source, config);

    return source;
  }

  loadConfigAsync.call(this, function (err, config) {
    if (err) {
      return callback(err);
    }

    try {
      checkSource.call(this, source, config);
    }
    catch (e) {
      return callback(e);
    }

    callback(null, source);
  }.bind(this));
};
