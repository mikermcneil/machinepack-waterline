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
      description: 'The Radar statement was compiled and the resulting native query was executed successfully.',
      moreInfoUrl: 'https://github.com/particlebanana/waterline-query-docs/blob/master/docs/results.md',
      outputFriendlyName: 'Query result',
      outputDescription: 'A normalized version of the result data from the database.',
      example: '==='
    },
    
    queryFailed: {
      description: 'The database returned an error when attempting to execute the native query compiled from the specified Radar statement.',
      extendedDescription:
      'The resulting footprint conforms to one of a handful of standardized footprint types expected by the Waterline driver interface.\n'+
      'If the error cannot be normalized into any other more specific footprint, then the catchall footprint will be returned.\n'+
      'The footprint (`footprint`) will be coerced to a JSON-serializable dictionary if it isn\'t one already (see [rttc.dehydrate()](https://github.com/node-machine/rttc#dehydratevalue-allownullfalse-dontstringifyfunctionsfalse)).\n'+
      'That means any Error instances therein will be converted to stacktrace strings.',
      moreInfoUrl: 'https://github.com/particlebanana/waterline-query-docs/blob/master/docs/errors.md',
      outputFriendlyName: 'Footprint',
      outputDescription: 'A normalized "footprint" dictionary representing the error from the database.',
      example: {}
    }

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
        // Note that we use `exits()` here instead of `exits.error()`.
        // This allows the `queryFailed` exit to be traversed automatically if the `err` has `exit: "queryFailed"`.
        // (In this case, `err.output` will be used as the actual output.  All of this behavior is built-in to the
        //  machine runner.)
        return exits(err);
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
