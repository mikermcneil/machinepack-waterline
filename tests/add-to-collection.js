var assert = require('assert');
var path = require('path');
var SailsApp = require('sails').Sails;
var Waterline = require('../');
var fsx = require('fs-extra');
var _ = require('lodash');
var lifecycle = require('./helpers/lifecycle');

describe('machinepack-waterline: add-to-collection', function() {
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

    it('should add the requested items to the collection', function(done) {

      // Attempt to add "roscoe" and "argus" to "joe"
      Waterline.addToCollection({
        model: 'user',
        recordId: 3,
        association: 'pets',
        associatedIdsToAdd: [4,5]
      })
      .setEnv({sails: app})
      .exec({
        error: done,
        success: function() {

          // See which pets "joe" has now
          app.models.user.findOne(3).populate('pets').exec(function(err, joe) {
            if (err) {return done(err);}
            assert(joe.pets.length, 2);
            assert(_.find(joe.pets, {id: 4}));
            assert(_.find(joe.pets, {id: 5}));
            return done();
          });

        }
      });

    });

  });

  describe('when called with a record ID that doesn\'t exist', function() {

    it('should trigger the `recordNotFound` exit', function(done) {

      // Attempt to add "roscoe" and "argus" to "joe"
      Waterline.addToCollection({
        model: 'user',
        recordId: 99,
        association: 'pets',
        associatedIdsToAdd: [4,5]
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


