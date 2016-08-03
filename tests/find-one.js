var assert = require('assert');
var path = require('path');
var SailsApp = require('sails').Sails;
var Waterline = require('../');
var fsx = require('fs-extra');
var _ = require('lodash');

describe('machinepack-waterline: find-one', function() {

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

    it('should find the requested record and populate it correctly', function(done) {

      // Attempt to find "bob" and his cat's name
      Waterline.findOne({
        model: 'user',
        where: {
          name: 'bob'
        },
        populate: [
          {
            association: 'pets',
            select: ['name'],
            where: {
              breed: 'siamese'
            },
            skip: 0,
            limit: 0,
            sort: []
          }
        ]
      })
      .setEnvironment({sails: app})
      .exec({
        error: done,
        notFound: function() {
          return done(new Error('Should not have called `notFound`!'));
        },
        success: function(bob) {
          assert.equal(bob.name, 'bob');
          assert.equal(bob.age, 40);
          assert(bob.pets.length, 1);
          assert(bob.pets[0].name, 'spot');
          assert(typeof bob.pets[0].breed, 'undefined');
          return done();
        }
      });

    });

  });

  describe('when called for a record that does not exist', function() {

    it('should trigger the `notFound` exit', function(done) {

      // Attempt to add "roscoe" and "argus" to "joe"
      Waterline.findOne({
        model: 'user',
        where: {
          id: 99
        }
      })
      .setEnvironment({sails: app})
      .exec({
        error: done,
        success: function() {
          return done(new Error('Should not have called `success` exit!'));
        },
        notFound: done

      });

    });

  });

});


