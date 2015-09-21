var express = require('express');
var bodyParser = require('body-parser')

module.exports = function(service) {

  var app = express();
  var log = require('./logger').get('api')

  app.use(bodyParser.json())
  app.use(function(error, req, res, next) {
    //catching bodyParser errors
    if (error instanceof SyntaxError) {
      req.body = error
      next()
    } else {
      next(error)
    }
  })
  app.set('json spaces', 4);
  app.use('/rest/v1/', require('./api/rest.v1.js')(service))
  //load routes
  //config what's needed

  //return app

  return {
    'listen': function(port) {
      app.listen(port)
      log.info('Listening on %s', port)
    }
  }

}
