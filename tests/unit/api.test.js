var API = _require('api');

describe('api', function() {
  it('provides listen method', function() {
    var instance = new API({})
    instance.listen.should.exist;
  });
});
