var assert = require('assert');
var path = require('path');
var SailsApp = require('sails').Sails;
var Waterline = require('../');
var fsx = require('fs-extra');
var _ = require('lodash');

describe('machinepack-waterline: find', function() {

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

    it('should find the requested records and populate them correctly', function(done) {

      // Attempt to find "bob" and "sally" their dog's names
      Waterline.find({
        model: 'user',
        where: {
          name: ['bob', 'sally']
        },
        populate: [
          {
            association: 'pets',
            select: ['name'],
            where: {
              breed: ['golden retriever', 'boxer']
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
        success: function(users) {
          assert.equal(users.length, 2);
          var bob = _.find(users, {id: 1});
          assert(bob);
          assert.equal(bob.name, 'bob');
          assert.equal(bob.age, 40);
          assert(bob.pets.length, 1);
          assert(bob.pets[0].name, 'farley');
          assert(typeof bob.pets[0].breed, 'undefined');
          var sally = _.find(users, {id: 2});
          assert(sally);
          assert.equal(sally.name, 'sally');
          assert.equal(sally.age, 29);
          assert(sally.pets.length, 1);
          assert(sally.pets[0].name, 'boxer');
          assert(typeof sally.pets[0].breed, 'undefined');
          return done();
        }
      });

    });

  });

});


