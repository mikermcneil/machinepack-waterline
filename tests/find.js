var assert = require('assert');
var path = require('path');
var SailsApp = require('sails').Sails;
var Waterline = require('../');
var fsx = require('fs-extra');
var _ = require('lodash');
var lifecycle = require('./helpers/lifecycle');

describe('machinepack-waterline: find', function() {

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
            select: [],
            where: {
              breed: ['golden retriever', 'boxer']
            },
            skip: 0,
            limit: 1000,
            sort: []
          }
        ]
      })
      .setEnv({sails: app})
      .exec({
        error: done,
        success: function(users) {
          assert.equal(users.length, 2);
          var bob = _.find(users, {id: 1});
          assert(bob);
          assert.equal(bob.name, 'bob');
          assert.equal(bob.age, 40);
          assert.equal(bob.pets.length, 1);
          assert.equal(bob.pets[0].name, 'farley');
          assert.equal(bob.pets[0].breed, 'golden retriever');
          var sally = _.find(users, {id: 2});
          assert(sally);
          assert.equal(sally.name, 'sally');
          assert.equal(sally.age, 29);
          assert.equal(sally.pets.length, 1);
          assert.equal(sally.pets[0].name, 'rex');
          assert.equal(sally.pets[0].breed, 'boxer');
          return done();
        }
      });

    });

    it('should sort records correctly (including populated records)', function(done) {

      // Attempt to find "bob" and "sally" their dog's names
      Waterline.find({
        model: 'user',
        where: {
          name: ['bob', 'sally']
        },
        sort: ['name desc'],
        populate: [
          {
            where: {},
            association: 'pets',
            select: [],
            skip: 0,
            limit: 1000,
            sort: ['breed desc']
          }
        ]
      })
      .setEnv({sails: app})
      .exec({
        error: done,
        success: function(users) {
          assert.equal(users.length, 2);
          var bob = users[1];
          assert(bob);
          assert.equal(bob.name, 'bob');
          assert.equal(bob.age, 40);
          assert.equal(bob.pets.length, 2);
          assert.equal(bob.pets[1].name, 'farley');
          assert.equal(bob.pets[1].breed, 'golden retriever');
          assert.equal(bob.pets[0].name, 'spot');
          assert.equal(bob.pets[0].breed, 'siamese');
          var sally = users[0];
          assert(sally);
          assert.equal(sally.name, 'sally');
          assert.equal(sally.age, 29);
          assert.equal(sally.pets.length, 1);
          assert.equal(sally.pets[0].name, 'rex');
          assert.equal(sally.pets[0].breed, 'boxer');
          return done();
        }
      });

    });

  });

});


