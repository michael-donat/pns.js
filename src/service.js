var events = require('events')
var uuid = require('node-uuid')
var model = require('./model')

var Service = function(config, cache) {

  config = config || {
    gateways: []
  }

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
    cache.set('#pns#'+message.uuid, JSON.stringify(status), 'EX', 60 * 60 * 24, function(err, res) {
      if (err) {
        return callback(err)
      }
      service.emit(getEventName(message), message)
      callback(null, status)
    })
  }

  this.status = function(id, callback) {
    cache.get('#pns#'+id, function(err, res) {
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
    log.info({id: id, status: status, error: error}, 'Received result.')
    service.status(id, function(err, result) {
      if (err) return;
      result.status = status;
      result.error = error;
      cache.set('#pns#'+id, JSON.stringify(result), 'EX', 60 * 60 * 24)
    })
  }

  config.gateways.forEach(function(gateway) {
    loadGateway(gateway, service)
  })

}

function loadGateway(gateway, service) {
  var Gateway = require('./'+gateway.name)
  new Gateway(gateway.options, service)
}

function getEventName(message) {
  return 'msg.'+message.type
}

Service.prototype.__proto__ = events.EventEmitter.prototype;

module.exports = Service
