var assert = require('assert');
var path = require('path');
var SailsApp = require('sails').Sails;
var Waterline = require('../');
var fsx = require('fs-extra');
var _ = require('lodash');
var lifecycle = require('./helpers/lifecycle');

describe('machinepack-waterline: remove-from-collection', function() {

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

    it('should remove the requested items from the collection', function(done) {

      // Attempt to remove "farley" from "bob"
      Waterline.removeFromCollection({
        model: 'user',
        recordId: 1,
        association: 'pets',
        associatedIdsToRemove: [1]
      })
      .setEnv({sails: app})
      .exec({
        error: done,
        success: function() {

          // See which pets "bob" has now
          app.models.user.findOne(1).populate('pets').exec(function(err, bob) {
            if (err) {return done(err);}
            assert.equal(bob.pets.length, 1);
            assert(_.find(bob.pets, {id: 2}));
            return done();
          });

        }
      });

    });

  });

  describe('when called with a record ID that doesn\'t exist', function() {

    it('should trigger the `recordNotFound` exit', function(done) {

      // Attempt to add "roscoe" and "argus" to "joe"
      Waterline.removeFromCollection({
        model: 'user',
        recordId: 99,
        association: 'pets',
        associatedIdsToRemove: [4,5]
      })
      .setEnv({sails: app})
      .exec({
        error: done,
        success: function() {
          return done(new Error('Should not have called `success` exit!'));
        },
        recordNotFound: function(){done();}

      });

    });

  });

});


