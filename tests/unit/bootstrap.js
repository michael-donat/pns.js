var rewire = require('rewire');
var sinon = require('sinon');
var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var sinonChai = require('sinon-chai');

require('sinon-as-promised');

chai.should();
chai.use(chaiAsPromised);
chai.use(sinonChai);

global.chaiAsPromised = chaiAsPromised;
global.expect = chai.expect;
global.AssertionError = chai.AssertionError;
global.Assertion = chai.Assertion;
global.assert = chai.assert;

global.sinon = sinon

global.rewire = rewire

global._require = function(module) {
  return require(process.env.FS_ROOT + '/' + module)
}

global._rewire = function(module) {
  return rewire(process.env.FS_ROOT + '/' + module)
}
