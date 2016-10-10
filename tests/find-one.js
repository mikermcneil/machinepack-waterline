var assert = require('assert');
var path = require('path');
var SailsApp = require('sails').Sails;
var Waterline = require('../');
var fsx = require('fs-extra');
var _ = require('lodash');
var lifecycle = require('./helpers/lifecycle');

describe('machinepack-waterline: find-one', function() {

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
            select: [],
            where: {
              breed: 'siamese'
            },
            skip: 0,
            limit: 0,
            sort: []
          }
        ]
      })
      .setEnv({sails: app})
      .exec({
        error: done,
        notFound: function() {
          return done(new Error('Should not have called `notFound`!'));
        },
        success: function(bob) {
          assert.equal(bob.name, 'bob');
          assert.equal(bob.age, 40);
          assert.equal(bob.pets.length, 1);
          assert.equal(bob.pets[0].name, 'spot');
          assert.equal(bob.pets[0].breed, 'siamese');
          return done();
        }
      });

    });


    it('should sort populated records correctly', function(done) {

      // Attempt to find "bob" and his cat's name
      Waterline.findOne({
        model: 'user',
        where: {
          name: 'bob'
        },
        populate: [
          {
            association: 'pets',
            select: [],
            where: {},
            skip: 0,
            limit: 0,
            sort: ['breed desc']
          }
        ]
      })
      .setEnv({sails: app})
      .exec({
        error: done,
        notFound: function() {
          return done(new Error('Should not have called `notFound`!'));
        },
        success: function(bob) {
          assert.equal(bob.name, 'bob');
          assert.equal(bob.age, 40);
          assert.equal(bob.pets.length, 2);
          assert.equal(bob.pets[0].name, 'spot');
          assert.equal(bob.pets[0].breed, 'siamese');
          assert.equal(bob.pets[1].name, 'farley');
          assert.equal(bob.pets[1].breed, 'golden retriever');
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
      .setEnv({sails: app})
      .exec({
        error: done,
        success: function() {
          return done(new Error('Should not have called `success` exit!'));
        },
        notFound: function(){done();}

      });

    });

  });

});


