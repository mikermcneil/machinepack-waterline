var assert = require('assert');
var path = require('path');
var SailsApp = require('sails').Sails;
var Waterline = require('../');
var fsx = require('fs-extra');
var _ = require('lodash');
var lifecycle = require('./helpers/lifecycle');

describe('machinepack-waterline: destroy', function() {

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

    it('should remove the requested instances when called w/ criteria', function(done) {

      // Attempt to remove all users besides "bob"
      Waterline.destroy({
        model: 'user',
        where: {
          id: {'>': 1}
        }
      })
      .setEnv({sails: app})
      .exec({
        error: done,
        success: function(numDeletedRecords) {
          assert.equal(numDeletedRecords, 3);
          // Check out the remaining user
          app.models.user.find().exec(function(err, users) {
            if (err) {return done(err);}
            assert.equal(users.length, 1);
            assert.equal(users[0].id, 1);
            return done();
          });

        }
      });

    });

    it('should remove all instances when called w/out criteria', function(done) {

      // Attempt to remove all pets
      Waterline.destroy({
        model: 'pet'
      })
      .setEnv({sails: app})
      .exec({
        error: done,
        success: function(numDeletedRecords) {
          assert.equal(numDeletedRecords, 7);
          // Make sure all pets are gone
          app.models.pet.find().exec(function(err, pets) {
            if (err) {return done(err);}
            assert.equal(pets.length, 0);
            return done();
          });

        }
      });

    });

  });

});


