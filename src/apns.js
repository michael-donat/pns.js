var events = require('events')
var model = require('./model')
var apn = require('apn');
var _ = require('lodash');
var moment = require('moment')

function mapErrorCode(code) {
  switch(code) {
    case 1:
      return 'Processing error';
    case 2:
      return 'Missing device token'
    case 3:
      return 'Missing topic'
    case 4:
      return 'Missing payload'
    case 5:
      return 'Invalid token size'
    case 6:
      return 'Invalid topic size'
    case 7:
      return 'Invalid payload size'
    case 8:
      return 'Invalid token'
    case 10:
      return 'Shutdown'
    default:
      return 'Unknown';
  }
}

var APNS = function(config, service) {

  events.EventEmitter.call(this);

  var _this = this;
  var apnsConnection = null;
  var apnsFeedback = null;

  var log = require('./logger').get('apns')

  this.connect = function connect() {

      var apnsFeedback = new apn.Feedback(_.assign({
        batchFeedback: true,
        interval: 10
      }, config));

      apnsFeedback.on('error', function(err) {
        throw err;
      })
      apnsFeedback.on('feedbackError', function(err) {
        log.warn(err)
      })
      apnsFeedback.on('feedback', function(devices) {
        var multi = service.cache.multi()
        devices.forEach(function(item) {
          multi.set('#pns#reject#'+item.device.token.toString('hex'), item.time)
        });
        multi.exec();
      });


      apnsConnection = new apn.Connection(config);
      apnsConnection.on('connected', function() {
        log.info('APNS connected.')
      })
      apnsConnection.on('error', function(err) {
        throw err;
      })
      apnsConnection.on('transmissionError', function(errorCode, notification, device) {
        var error = errorCode + ' : ' + mapErrorCode(errorCode)
        log.warn(error)
        _this.emit('msg.result', notification.uuid, model.enum.Status.FAILED, {
          code: errorCode, message: mapErrorCode(errorCode)
        })
      })
      apnsConnection.on('transmitted', function(notification, device) {
        _this.emit('msg.result', notification.uuid, model.enum.Status.SENT)
      })
  }

  this.handle = function handle(msg) {

    service.cache.get('#pns#reject#'+msg.device, function(err, res) {
      if (res) {
        //we recognised this token as previously rejected, need to check time
        //of rejection to see whether it's been reregistered
        if (res > msg.registration) {
          //this is a rejected token
          _this.emit('msg.result', msg.uuid, model.enum.Status.REJECTED, {
            code: -1, message: 'Token rejected on '+moment.unix(res).format()
          })

          return;
        }
      }

      var device = new apn.Device(msg.device);
      var note = new apn.Notification();

      if (msg.badge) note.badge = msg.badge;
      if (msg.sound) note.sound = msg.sound;
      if (msg.payload) note.payload = msg.payload;

      note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
      note.alert = msg.body;
      note.uuid = msg.uuid;

      apnsConnection.pushNotification(note, device);
    })
  }

  service.on('start', this.connect)
  service.on('msg.apns', this.handle)
  this.on('msg.result', service.result)
}

APNS.prototype.__proto__ = events.EventEmitter.prototype;

module.exports = APNS
