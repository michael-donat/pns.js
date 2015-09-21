var events = require('events')
var uuid = require('node-uuid')
var model = require('./model')

var Service = function(config, cache) {

  this.cache = cache;
  var service = this;

  events.EventEmitter.call(this);

  var log = require('./logger').get('service')

  this.start = function() {
      log.info('Starting.')
      this.emit('start')
  }

  this.send = function(message, callback) {
    message.uuid = uuid.v4()
    var status = new model.Status(message.uuid, model.enum.Status.ACCEPTED)
    cache.set(message.uuid, JSON.stringify(status), 'EX', 60 * 60 * 24, function(err, res) {
      if (err) {
        return callback(err)
      }
      service.emit(getEventName(message), message)
      callback(null, status)
    })
  }

  this.status = function(id, callback) {
    cache.get(id, function(err, res) {
      if (err) {
        return callback(err)
      }
      if (!res) {
        return callback(new model.MessageNotFoundError(id))
      }
      callback(null, JSON.parse(res))
    })
  }

  this.result = function(id, status, error) {
    service.status(id, function(err, result) {
      if (err) return;
      result.status = status;
      result.error = error;
      cache.set(id, JSON.stringify(result), 'EX', 60 * 60 * 24)
    })
  }

  config.gateways.forEach(function(gateway) {
    var Gateway = require('./'+gateway.name)
    new Gateway(gateway.options, service)
  })

}

function getEventName(message) {
  return 'msg.'+message.type
}

Service.prototype.__proto__ = events.EventEmitter.prototype;

module.exports = Service
