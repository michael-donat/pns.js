var bunyan = require('bunyan');

var loggers = {};

var dummy = (function() {
  this.fatal = function() {}
  this.error = function() {}
  this.warn = function() {}
  this.info = function() {}
  this.debug = function() {}
  this.trace = function() {}
})()

module.exports.enable = function(config) {

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
