module.exports = {


  friendlyName: 'Connect',


  description: 'Lease a database connection, perform some logic, then release it back from whence it came.',


  habitat: 'sails',


  inputs: {

    datastore: {
      description: 'The identity of the datastore to use.',
      example: 'larrysMySQLCluster',
      required: true
    },

    during: {
      description: 'A function with custom logic to run once the connection is established.',
      extendedDescription: 'This function will be provided access to the active database connection.',
      example: '->',
      required: true,
      contract: {
        inputs: {
          connection: { example: '===' }
        },
        exits: {
          success: {
            outputFriendlyName: 'Result',
            outputDescription: 'The data (if any) returned from the connection callback.',
            outputExample: '==='
          }
        }
      }
    },

    // meta: require('../constants/meta.input')

  },


  exits: {

    success: {
      description: 'The connection was acquired successfully, the specified logic ran without incident, and the connection was released.',
      outputFriendlyName: 'Result',
      outputDescription: 'The result data (if any) sent back by the provided logic (`during`).',
      outputExample: '==='
    },

  },


  fn: function(inputs, exits) {

    // Import `isObject` and `isUndefined` Lodash functions.
    var _isObject = require('lodash.isobject');
    var _isUndefined = require('lodash.isundefined');

    // If we don't have a Sails app in our environment, bail early through the `error` exit.
    if (!_isObject(env.sails)) {
      return exits.error(new Error('A valid Sails app must be provided through `.setEnv()` in order to use this machine.'));
    }

    // If we can't access the ORM, leave through the `error` exit.
    if (!_isObject(env.sails.hooks.orm)) {
      return exits.error(new Error('`sails.hooks.orm` cannot be accessed; please ensure this machine is being run in a compatible habitat.'));
    }

    // Attempt to load the specified datastore, or else leave through the `error` exit.
    var Datastore = env.sails.hooks.orm.datastores[inputs.datastore];
    if (!_isObject(Datastore)) {
      return exits.error(new Error('Unrecognized datastore (`'+inputs.datastore+'`).  Please check your `config/datastores.js` file to verify that a datastore with this identity exists.'));
    }

    // Start building the deferred object.
    var pending = Datastore.connect(function _duringConnection(connection, done) {
      inputs.during({ connection: connection }).exec(done);
    });

    // Use metadata if provided.
    if (!_isUndefined(inputs.meta)) {
      pending = pending.meta(inputs.meta);
    }

    // Now kick everything off.
    // This acquires the connection, runs the provided query,
    // and releases the connection when finished.
    pending.exec(function afterwards(err, result, meta) {
      // Forward any errors to the `error` exit.
      if (err) {
        return exits.error(err);
      }
      // Otherwise return the result of the `during` logic through the `success` exit.
      return exits.success(result);
    });
    //
    // Note that, behind the scenes, Waterline is doing:
    //
    // Datastore.driver.getConnection({manager: Datastore.manager})
    // _duringConnection()
    // Datastore.driver.releaseConnection()
  },


};
