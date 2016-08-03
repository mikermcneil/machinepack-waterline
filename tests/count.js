var assert = require('assert');
var path = require('path');
var SailsApp = require('sails').Sails;
var Waterline = require('../');
var fsx = require('fs-extra');
var _ = require('lodash');

describe('machinepack-waterline: count', function() {

  var Sails = new SailsApp();
  var app;
  before(function(done) {
    process.chdir(path.resolve(__dirname, 'fixtures', 'app'));
    fsx.copySync('localDiskDb.db', path.resolve('.tmp', 'localDiskDb.db'));
    Sails.load({
      hooks: {grunt: false, views: false},
      globals: false
    }, function(err, _sails) {
      if (err) {return done(err);}
      app = _sails;
      return done();
    });
  });

  after(function(done) {
    app.lower(function(err) {
      if (err) {return done(err);}
      setTimeout(done, 500);
    });
  });

  describe('when called with valid inputs', function() {

    it('should count all the records when no criteria are used', function(done) {

      // Count all the users
      Waterline.count({
        model: 'user'
      })
      .setEnvironment({sails: app})
      .exec({
        error: done,
        success: function(count) {
          assert.equal(count, 4);
          return done();
        }
      });

    });

    it('should count only the requested records when criteria are used', function(done) {

      // Count all users with ID > 2
      Waterline.count({
        model: 'user',
        where: {
          id: {'>': 2}
        }
      })
      .setEnvironment({sails: app})
      .exec({
        error: done,
        success: function(count) {
          assert.equal(count, 2);
          return done();
        }
      });

    });

  });

});


