var bunyan = require('bunyan');
var _ = require('lodash')

var loggers = {};

function dummyLogger() {
  this.fatal = function() {}
  this.error = function() {}
  this.warn = function() {}
  this.info = function() {}
  this.debug = function() {}
  this.trace = function() {}
}

var dummy = new dummyLogger();

module.exports.enable = function(config) {

  if(_.isString(config) || (!_.isArray(config) && _.isObject(config))) {
    config = [config]
  }

  config.forEach(function(config) {

      if (typeof config == 'string') {
            var name = config
            config = {name: name}
      }

      loggers[config.name] = bunyan.createLogger(config)
  })
}

module.exports.get = function(name) {
  return loggers[name] || dummy
}

module.exports.loggers = loggers;
