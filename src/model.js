module.exports.message = {}

module.exports.message.Apple = function(device, registration, sound, badge, body, payload) {
  this.type = 'apns';
  this.device = device;
  this.registration = registration;
  this.payload = payload;
  this.sound = sound;
  this.badge = badge;
  this.body = body;
}

module.exports.enum = {}

module.exports.enum.Status = {
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  SENT: 'sent',
  FAILED: 'failed',
  ERROR: 'error'
}

module.exports.Status = function(uuid, status) {
  this.error = undefined;
  this.uuid = uuid;
  this.status = status;
}

module.exports.ValidationError = function(failures) {
  this.message = "Validaton Error"
  this.code = 400
  this.type = "ValidationError"
  this.failures = failures
}

module.exports.InvalidRequestError = function(message) {
  this.message = message
  this.code = 400
  this.type = "InvalidRequestError"
}

module.exports.MessageNotFoundError = function(id) {
  this.message = 'Message not found'
  this.code = 404
  this.type = "MessageNotFoundError"
  this.id = id
}
