var path = require('path');
var SailsApp = require('sails').Sails;
var fsx = require('fs-extra');
var _ = require('lodash');

module.exports = {
  liftSails: function(cb) {

    var Sails = new SailsApp();
    var app;
    process.chdir(path.resolve(__dirname, '..', 'fixtures', 'app'));
    fsx.copySync('localDiskDb.db', path.resolve('.tmp', 'localDiskDb.db'));
    Sails.load({
      hooks: {grunt: false, views: false},
      globals: false
    }, cb);

  },

  lowerSails: function(sails, cb) {
    sails.lower(function(err) {
      if (err) {return cb(err);}
      setTimeout(cb, 500);
    });
  }
};
