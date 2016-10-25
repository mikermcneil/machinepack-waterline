var assert = require('assert');
var path = require('path');
var SailsApp = require('sails').Sails;
var Waterline = require('../');
var fsx = require('fs-extra');
var _ = require('lodash');
var lifecycle = require('./helpers/lifecycle');

describe('machinepack-waterline: create', function() {

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

    it('should add the new model instance', function(done) {

      // Attempt to add a new user "bubba" with pet "argus"
      Waterline.create({
        model: 'user',
        attributes: {
          name: 'bubba',
          age: 22,
          pets: [4,5]
        }
      })
      .setEnv({sails: app})
      .exec({
        error: done,
        success: function(newRecordId) {
          assert.equal(newRecordId, 5);
          // Check out the new record
          app.models.user.findOne(5).populate('pets').exec(function(err, bubba) {
            if (err) {return done(err);}
            assert.equal(bubba.name, 'bubba');
            assert.equal(bubba.age, 22);
            assert(bubba.pets.length, 2);
            assert(_.find(bubba.pets, {id: 4}));
            assert(_.find(bubba.pets, {id: 5}));
            return done();
          });

        }
      });

    });

  });

  describe('when called with invalid attributes', function() {

    it('should trigger the `invalidAttributes` exit', function(done) {

      // Attempt to add a new user with invalid attributes
      Waterline.create({
        model: 'user',
        attributes: {
          name: {abc:123},
          age: 'foobar'
        }
      })
      .setEnv({sails: app})
      .exec({
        error: function(err) {return done(new Error('Should have triggered invalidAttributes exit, but triggered `error` instead!'));},
        success: function(output) {return done(new Error('Should have triggered invalidAttributes exit, but triggered `success` instead!'));},
        invalidAttributes: function(err) {
          assert(err.name);
          assert(err.age);
          return done();
        }
      });

    });

  });

});


