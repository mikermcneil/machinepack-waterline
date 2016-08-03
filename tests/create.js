var assert = require('assert');
var path = require('path');
var SailsApp = require('sails').Sails;
var Waterline = require('../');
var fsx = require('fs-extra');
var _ = require('lodash');

describe('machinepack-waterline: create', function() {

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

    it('should add the new model instance', function(done) {

      // Attempt to add a new user "roscoe" with pet "argus"
      Waterline.create({
        model: 'user',
        attributes: {
          name: 'bubba',
          age: '22',
          pets: [4,5]
        }
      })
      .setEnvironment({sails: app})
      .exec({
        error: done,
        success: function(newRecordId) {
          assert.equal(newRecordId, 5);
          // Check out the new record
          app.models.user.findOne(5).populate('pets').exec(function(err, bubba) {
            if (err) {return done(err);}
            assert.equal(bubba.name, 'bubba');
            assert.equal(bubba.age, 22);
            assert(bubba.pets.length, 2);
            assert(_.find(bubba.pets, {id: 4}));
            assert(_.find(bubba.pets, {id: 5}));
            return done();
          });

        }
      });

    });

  });

});


