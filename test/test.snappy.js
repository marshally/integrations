
var express      = require('express')
  , facade       = require('segmentio-facade')
  , helpers      = require('./helpers')
  , integrations = require('..')
  , should       = require('should')
  , settings     = require('./auth.json')['Snappy']
  , cio          = new integrations['Snappy']();


var app = express().use(express.bodyParser())
  , server;


describe('Snappy', function () {

  before(function (done) { server = app.listen(4000, done); });
  after(function(done) { server.close(done); });

  describe('.enabled()', function () {

    it('should only be enabled for server side messages', function () {
      cio.enabled(new facade.Alias({ channel : 'server' })).should.be.ok;
      cio.enabled(new facade.Alias({ channel : 'client' })).should.not.be.ok;
      cio.enabled(new facade.Alias({})).should.not.be.ok;
    });
  });


  describe('.validate()', function () {

    it('should require an appToken', function () {
      cio.validate({}, {}).should.be.an.instanceOf(Error);
      cio.validate({}, {appToken : '' }).should.be.an.instanceOf(Error);
    });

    it('should validate with the required settings', function () {
      should.not.exist(cio.validate({}, { appToken : 'xxx' }));
    });
  });


  describe('.track()', function () {

    it('should get a good response from the API', function (done) {
      var track = helpers.track();
      cio.track(track, settings, done);
    });

    it('will error on an invalid set of keys', function (done) {
      var track = helpers.track();
      cio.track(track, { appToken : 'x' }, function (err) {
        should.exist(err);
        err.status.should.eql(401);
        done();
      });
    });
  });

  describe('.identify()', function () {

    it('should get a good response from the API', function (done) {
      var identify = helpers.identify();
      cio.identify(identify, settings, done);
    });

    it('will error on an invalid set of keys', function (done) {
      var identify = helpers.identify();
      cio.identify(identify, { appToken : 'x' }, function (err) {
        should.exist(err);
        err.status.should.eql(401);
        done();
      });
    });
  });
});
