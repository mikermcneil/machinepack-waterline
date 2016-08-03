var assert = require('assert');
var path = require('path');
var SailsApp = require('sails').Sails;
var Waterline = require('../');
var fsx = require('fs-extra');
var _ = require('lodash');

describe('machinepack-waterline: update', function() {

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

    it('should update the requested model instance', function(done) {

      // Attempt to change "princess"'s name to "queen"
      Waterline.update({
        model: 'pet',
        where: {
          name: 'princess'
        },
        attributes: {
          name: 'queen'
        }
      })
      .setEnvironment({sails: app})
      .exec({
        error: done,
        success: function(numUpdatedRecords) {
          assert.equal(numUpdatedRecords, 1);
          // Check out the updated record
          app.models.pet.findOne({name: 'queen'}).exec(function(err, queen) {
            if (err) {return done(err);}
            if (!queen) {return done(new Error('The record was not updated!'));}
            return done();
          });

        }
      });

    });

  });

});


