var assert = require('assert');
var path = require('path');
var SailsApp = require('sails').Sails;
var Waterline = require('../');
var fsx = require('fs-extra');
var _ = require('lodash');

describe('machinepack-waterline: replace-collection', function() {

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

    it('should replace the items in the collection with the requested items', function(done) {

      // Attempt to replace "farley" and "roscoe" with in "bob" with "princess" and "gordon"
      Waterline.replaceCollection({
        model: 'user',
        recordId: 1,
        association: 'pets',
        associatedIds: [6, 7]
      })
      .setEnvironment({sails: app})
      .exec({
        error: done,
        success: function() {

          // See which pets "bob" has now
          app.models.user.findOne(1).populate('pets').exec(function(err, bob) {
            if (err) {return done(err);}
            assert.equal(bob.pets.length, 2);
            assert(_.find(bob.pets, {id: 6}));
            assert(_.find(bob.pets, {id: 7}));
            return done();
          });

        }
      });

    });

    it('should add the requested items in the collection if it\'s empty', function(done) {

      // Attempt to add "roscoe" and "argus" to "anne"
      Waterline.replaceCollection({
        model: 'user',
        recordId: 4,
        association: 'pets',
        associatedIds: [4, 5]
      })
      .setEnvironment({sails: app})
      .exec({
        error: done,
        success: function() {

          // See which pets "anne" has now
          app.models.user.findOne(4).populate('pets').exec(function(err, anne) {
            if (err) {return done(err);}
            assert.equal(anne.pets.length, 2);
            assert(_.find(anne.pets, {id: 4}));
            assert(_.find(anne.pets, {id: 5}));
            return done();
          });

        }
      });

    });

    it('should empty the collection if the `associatedIds` input is an empty array', function(done) {

      // Remove all pets from "sally"
      Waterline.replaceCollection({
        model: 'user',
        recordId: 2,
        association: 'pets',
        associatedIds: []
      })
      .setEnvironment({sails: app})
      .exec({
        error: done,
        success: function() {

          // See which pets "sally" has now
          app.models.user.findOne(2).populate('pets').exec(function(err, sally) {
            if (err) {return done(err);}
            assert.equal(sally.pets.length, 0);
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
      .setEnvironment({sails: app})
      .exec({
        error: done,
        success: function() {
          return done(new Error('Should not have called `success` exit!'));
        },
        recordNotFound: done

      });

    });

  });

});


