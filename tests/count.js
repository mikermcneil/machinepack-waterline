var assert = require('assert');
var path = require('path');
var SailsApp = require('sails').Sails;
var Waterline = require('../');
var fsx = require('fs-extra');
var _ = require('lodash');
var lifecycle = require('./helpers/lifecycle');

describe('machinepack-waterline: count', function() {

  var Sails = new SailsApp();
  var app;
  before(function(done) {
    lifecycle.liftSails(function(err, _sails) {
      if (err) {return done(err);}
      app = _sails;
      return done();
    });
  });

  after(function(done) {
    lifecycle.lowerSails(app, done);
  });

  describe('when called with valid inputs', function() {

    it('should count all the records when no criteria are used', function(done) {

      // Count all the users
      Waterline.count({
        model: 'user'
      })
      .setEnv({sails: app})
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
      .setEnv({sails: app})
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


