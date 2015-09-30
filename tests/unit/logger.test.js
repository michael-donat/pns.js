var logger = _require('logger');
var bunyan = require('bunyan')

describe('logger', function() {
  describe('#get', function() {
    it('returns dummy loger if one not found', function() {
      logger.get('obviously not a logger name').constructor.name.should.equal('dummyLogger')
    });
    it('returns named logger', function() {
      logger.loggers.named = 1;
      logger.get('named').should.equal(1)
    });
  });
  describe('#enable', function() {
    it('enables logger by name', function() {
      logger.enable('named')
      logger.get('named').fields.name.should.equal('named')
    })
    it('enables logger by array of names', function() {
      logger.enable(['one', 'two'])
      logger.get('one').fields.name.should.equal('one')
      logger.get('two').fields.name.should.equal('two')
    })
    it('enables logger by config object', function() {
      logger.enable({name: 'named1'})
      logger.get('named1').fields.name.should.equal('named1')
    })
    it('enables logger with passed config', function() {
      logger.enable({name: 'named3', level: 123})
      logger.get('named3').fields.name.should.equal('named3')
      logger.get('named3')._level.should.equal(123)
    })
    it('enables loggers by array of config object', function() {
      logger.enable({name: 'named5'})
      logger.enable({name: 'named6', level: 321})
      logger.get('named5').fields.name.should.equal('named5')
      logger.get('named6').fields.name.should.equal('named6')
      logger.get('named6')._level.should.equal(321)
    })
    it('creates bunyan logger', function() {
      logger.enable('bunyan')
      logger.get('bunyan').should.be.instanceOf(bunyan)
    })
  })
});
