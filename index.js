var config = require('./config.json')
var Service = require('./src/service.js')
var API = require('./src/api.js')
var redis = require('redis')

require('./src/logger').enable([
  {name: 'api', level: 20}, 'service', 'apns'
])

var cache = redis.createClient();

var service = new Service(config, cache)
var api = new API(service)

service.start();
api.listen(process.env.API_PORT || config.api.port);
