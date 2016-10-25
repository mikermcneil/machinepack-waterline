var assert = require('assert');
var path = require('path');
var SailsApp = require('sails').Sails;
var Waterline = require('../');
var fsx = require('fs-extra');
var _ = require('lodash');
var lifecycle = require('./helpers/lifecycle');

describe('machinepack-waterline: avg', function() {

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

    it('should average all the records when no criteria are used', function(done) {

      // Get the average age of the users
      Waterline.avg({
        model: 'user',
        attribute: 'age'
      })
      .setEnv({sails: app})
      .exec({
        error: done,
        success: function(age) {
          assert.equal(age, 28.25);
          return done();
        }
      });

    });

    it('should average only the requested records when criteria are used', function(done) {

      // Get the average age of "joe" and "anne"
      Waterline.avg({
        model: 'user',
        attribute: 'age',
        where: {
          id: {'>': 2}
        }
      })
      .setEnv({sails: app})
      .exec({
        error: done,
        success: function(age) {
          assert.equal(age, 22);
          return done();
        }
      });

    });

    it('should work correctly with limit, skip and sort', function(done) {

      // Get the average age of "sally" and "anne"
      Waterline.avg({
        model: 'user',
        attribute: 'age',
        limit: 2,
        skip: 1,
        sort: ['age asc']
      })
      .setEnv({sails: app})
      .exec({
        error: done,
        success: function(age) {
          assert.equal(age, 30.5);
          return done();
        }
      });

    });

  });

  it('should trigger the `invalidAttribute` exit when called when called with an invalid attribute', function(done) {

    // Get the average age of the users
    Waterline.avg({
      model: 'user',
      attribute: 'xxx'
    })
    .setEnv({sails: app})
    .exec({
      error: done,
      success: function() {
        return done(new Error('Should not have called the `success` exit!'));
      },
      invalidAttribute: function(){done();}
    });

  });

  it('should call the error exit when called with an invalid `skip` value', function(done) {

    Waterline.avg({
      model: 'user',
      attribute: 'age',
      limit: 2,
      skip: -1,
      sort: ['age asc']
    })
    .setEnv({sails: app})
    .exec({
      error: function(){return done();},
      success: function() {
        return done(new Error('Should not have called the `success` exit!'));
      },
      invalidAttribute: function(){
        return done(new Error('Should not have called the `invalidAttribute` exit!'));
      }
    });

  });

  it('should call the error exit when called with an invalid `limit` value', function(done) {

    Waterline.avg({
      model: 'user',
      attribute: 'age',
      limit: -2,
      skip: 1,
      sort: ['age asc']
    })
    .setEnv({sails: app})
    .exec({
      error: function(){return done();},
      success: function() {
        return done(new Error('Should not have called the `success` exit!'));
      },
      invalidAttribute: function(){
        return done(new Error('Should not have called the `invalidAttribute` exit!'));
      }
    });

  });

});


