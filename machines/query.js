module.exports = {


  friendlyName: 'Query',


  description: 'Compile a radar query statement into the native dialect for a database, then send the native query.',


  habitat: 'sails',


  inputs: {

    datastore: {
      description: 'The identity of the datastore to use.',
      example: 'larrysMySQLCluster',
      required: true
    },

    statement: {
      description: 'A radar query statement to compile and send to the database.',
      example: {},
      required: true
    },

    connection: {
      description: 'An existing connection to use (otherwise, by default, a new connection is acquired from the datastore).',
      example: '==='
    },

    meta: {
      description: 'Additional driver-specific metadata to pass to Waterline.',
      example: '==='
    }

  },


  exits: {

    success: {
      description: 'The radar query was compiled and executed successfully.',
      outputVariableName: 'result',
      outputDescription: 'A normalized version of the result data from the database.',
      example: '==='
    },

  },


  fn: function(inputs, exits) {
    var util = require('util');

    if (!util.isObject(env.sails.hooks.orm)) {
      return exits.error(new Error('`sails.hooks.orm` cannot be accessed; please ensure this machine is being run in a compatible habitat.'));
    }

    var Datastore = env.sails.hooks.orm.datastores[inputs.datastore];
    if (!util.isObject(Datastore)) {
      return exits.error(new Error('Unrecognized datastore (`'+inputs.datastore+'`).  Please check your `config/datastores.js` file to verify that a datastore with this identity exists.'));
    }

    // Start building the deferred object.
    var pending = Datastore.query(inputs.statement);

    // Use metadata if provided.
    if (!util.isUndefined(inputs.meta)) {
      pending = pending.meta(inputs.meta);
    }

    // Use existing connection if one was provided.
    if (!util.isUndefined(inputs.connection)) {
      pending = pending.usingConnection(inputs.connection);
    }

    // Now kick everything off.
    // (this acquires the connection, runs the provided query,
    //  and releases the connection when finished)
    pending.exec(function afterwards(err, result, meta) {
      if (err) {
        return exits.error(err);
      }
      return exits.success(result);
    });
    //
    // Note that, behind the scenes, Waterline is doing:
    //
    // Datastore.driver.compileQuery()
    // Datastore.driver.getConnection({manager: Datastore.manager})
    // Datastore.driver.sendNativeQuery()
    // |
    // |_ Datastore.driver.parseNativeQueryResult()
    // |  Datastore.driver.releaseConnection()
    //-or-
    // |_ Datastore.driver.parseNativeQueryError()
    //    Datastore.driver.releaseConnection()
  },



};
