var events = require('events')
var gcm = require('node-gcm')
var model = require('./model')

var GCM = function(config, service) {

  events.EventEmitter.call(this);

  var _this = this;
  var gcmConnection = null;

  var log = require('./logger').get('gcm')

  this.connect = function connect() {
      gcmConnection = new gcm.Sender(config.api.key);

      log.info('GCM prepared.')
  }

  this.handle = function handle(msg) {

    var message = new gcm.Message();

    message.addNotification(msg.title, msg.body || undefined);

    if (msg.payload) message.addData(msg.payload)

    gcmConnection.send(message, { registrationIds: [msg.device] }, function (err, result) {

      if (err) {
        log.error(err)
        return _this.emit('msg.result', msg.uuid, model.enum.Status.ERROR, err)
      }

      if (result.failure > 0) {
        log.warn(result.results[0].error)
        return _this.emit('msg.result', msg.uuid, model.enum.Status.FAILED, {code: 1, message: result.results[0].error})
      }

      _this.emit('msg.result', msg.uuid, model.enum.Status.SENT)

    });

  }

  service.on('start', this.connect)
  service.on('msg.gcm.android', this.handle)
  this.on('msg.result', service.result)
}

GCM.prototype.__proto__ = events.EventEmitter.prototype;

module.exports = GCM
