var Service = _rewire('service')

var proxyquire = require('proxyquire').noCallThru();

var model = _require('model')

describe('service', function() {

  it('initialises gateways based on config', function() {

    var spy = sinon.spy();

    var Service = proxyquire('./../../src/service', {'./test': spy});

    var service = new Service({gateways: [{name: 'test', options: 1}]})

    spy.should.be.calledWith(1, service)

  });

  it('exposes interface', function() {
    var service = new Service()
  });

  describe('#start', function() {
    it('it emits start event', function() {

      var service = new Service();
      var spy = sinon.spy();

      service.on('start', spy)

      service.start()

      spy.should.be.called

    });
  });
  describe('#send', function() {
    it('sets status in cache', function() {
      var spy = sinon.spy();
      var service = new Service(null, {set: spy})

      service.send({})

      spy.should.be.calledWith(
        sinon.match.string,
        sinon.match.string,
        sinon.match.string,
        sinon.match.number,
        sinon.match.func
      )
    });
    it('calls callback on sucessfull cache set', function() {
      var service = new Service(null, {set: function() {
        var args = arguments;
        args[args.length - 1](null, 'ok')
      }});
      var spy = sinon.spy()
      service.send({}, spy)

      sinon.assert.calledWith(
        spy,
        null,
        sinon.match.object
      )
    })
    it('calls callback on error cache set', function() {
      var service = new Service(null, {set: function() {
        var args = arguments;
        args[args.length - 1](true)
      }});
      var spy = sinon.spy()
      service.send({}, spy)

      sinon.assert.calledWith(
        spy,
        sinon.match.truthy
      )
    })
    it('emits message event on sucessfull cache set', function() {
      var service = new Service(null, {set: function() {
        var args = arguments;
        args[args.length - 1](null, true)
      }});

      var spy = sinon.spy()

      Service.__with__({
        'getEventName': function() {return 'msg';}
      })(function() {
        service.on('msg', spy)
        service.send({}, function(){})
      });

      spy.should.be.calledWith(sinon.match.object)
    }),
    it('emits event based on message type', function() {
      var service = new Service(null, {set: function() {
        var args = arguments;
        args[args.length - 1](null, true)
      }});

      var oneSpy = sinon.spy()
      var twoSpy = sinon.spy()

      service.on('msg.one', oneSpy)
      service.on('msg.two', twoSpy)

      var msgOne = {type: 'one'}
      var msgTwo = {type: 'two'}

      service.send(msgOne, function(){})
      service.send(msgTwo, function(){})

      oneSpy.should.be.calledWith(msgOne)
      twoSpy.should.be.calledWith(msgTwo)

    })
  })
  describe('#status', function() {
    it('gets status from cache by id with callback', function() {
      var spy = sinon.spy();
      var service = new Service(null, {get: spy})

      service.status('id', function(){})

      spy.should.be.calledWith('id', sinon.match.func)
    })
    it('calls back with error on cache failure', function() {
      var spy = sinon.spy();
      var service = new Service(null, {get: function(id, callback) {
        callback(true)
      }})

      service.status('id', spy)

      spy.should.be.calledWith(true)
    })
    it('calls back with NotFound on cache miss', function() {
      var spy = sinon.spy();
      var service = new Service(null, {get: function(id, callback) {
        callback(null, null)
      }})

      service.status('id', spy)

      spy.should.be.calledWith(
        sinon.match.instanceOf(model.MessageNotFoundError).and(
          sinon.match.hasOwn('id', 'id')
        )
      )
    })
    it('calls back with parsed cache return', function() {
      var spy = sinon.spy();
      var service = new Service(null, {get: function(id, callback) {
        callback(null, JSON.stringify({}))
      }})

      service.status('id', spy)

      spy.should.be.calledWith(sinon.match.falsy, sinon.match.object)
    })
  })
  describe('#result', function() {
    it('sets new result in cache', function() {
      var spy = sinon.spy();
      var service = new Service(null, {set: spy, get: function(id, callback) {
        callback(null, JSON.stringify({}))
      }})

      service.result('id', 'changed', 'error')

      spy.should.be.calledWith(
        'id',
        sinon.match(function(value) {
          var test = JSON.parse(value)
          return test.error == 'error' && test.status == 'changed'
        }),
        'EX',
        sinon.match.number
      )
    })
    it('does not set new result on cache fail/miss', function() {
      var spy = sinon.spy();
      var service = new Service(null, {set: spy, get: function(id, callback) {
        callback(true)
      }})

      service.result('id', 'changed', 'error')

      spy.should.not.be.called
    })
  })
});
