var express = require('express');
var router = express.Router();
var moment = require('moment')
var model = require('./../model')
var util = require('util')

var messageSchema = {
  "id": "/rest.v1.message",
  "type": "object",
  "additionalProperties": false,
  "required": ["address", "payload"],
  "properties": {
    "address": {"$ref": "#/definitions/address"},
    "payload": {"oneOf": [
      { "$ref": "#/definitions/payload.apple"}
    ]}
  },
  "definitions": {
    "address": {
      "additionalProperties": false,
      "type": "object",
      "required": ["created", "type", "detail"],
      "properties": {
        "created": {"type": "string", "format": "date-time"},
        "type": {"type": "string", "enum": ["apns", "gcm"]},
        "detail": {"type": "string"}
      }
    },
    "payload.apple": {
      "additionalProperties": false,
      "type": "object",
      "required": ["body"],
      "properties": {
        "badge": {"type": "integer"},
        "sound": {"type": "string"},
        "body": {"type": "string"},
        "payload": {"type": "object"},
      }
    }
  }
};

function Renderer() {

  var validate = require('jsonschema').validate;

  function buildAPNS(msg) {
    return new model.message.Apple(
      msg.address.detail,
      moment(msg.address.created).utc().format('X'),
      msg.payload.sound,
      msg.payload.badge,
      msg.payload.body,
      msg.payload.payload
    )
  }

  this.in = function(msg) {

    if (msg instanceof Error) {
      throw new model.InvalidRequestError('Could not parse JSON payload')
    }

    var validation = validate(msg, messageSchema);

    if (validation.errors.length) {
      throw new model.ValidationError(validation.errors.map(function(item) {
        return util.format('Property \'%s\' %s', item.property, item.message)
      }))
    }

    if (msg.address.type == 'apns') {

      if(!/^[A-F0-9]+$/i.test(msg.address.detail)) {
        throw new model.InvalidRequestError('Detail must be a HEX string.')
      }

      return buildAPNS(msg)
    }

    throw new Error('Not implemented')
  }
  this.out = function(result, res) {
    res.json(result)
  }
  this.error = function(error, res) {
    if (error.code) {
      res.status(error.code)
    }
    if (error.type) {
      return res.json(error)
    }
    res.json({'error': error.message})
  }
}

module.exports = function(service) {

  var log = require('./../logger').get('api')

  var renderer = new Renderer();

  router.get('/', function(req, res) {
    res.json(messageSchema)
  })

  router.post('/message', function(req, res) {
    try {
      var message = renderer.in(req.body)
    } catch(err) {
      return renderer.error(err, res)
    }
    service.send(message, function(err, result) {
      if (err) {
        return renderer.error(err, res)
      }
      return renderer.out(result, res)
    })
  })

  router.get('/message/:id', function(req, res) {

    log.debug('Status received for \'%s\'', req.params.id)

    service.status(req.params.id, function(err, result) {
      if (err) {
        return renderer.error(err, res)
      }
      return renderer.out(result, res)
    })
  })

  return router;
}
