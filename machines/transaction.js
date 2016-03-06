module.exports = {


  friendlyName: 'Transaction',


  description: 'Begin a transaction, perform some logic, then either commit the transaction if everything worked, or roll it back if there were any errors.',


  environment: ['sails'],


  inputs: {

    datastore: {
      description: 'The identity of the datastore to use.',
      example: 'larrysMySQLCluster',
      required: true
    },

    during: {
      description: 'A function with custom logic to run once a database connection is established and a transaction has begun.',
      extendedDescription: 'This function will be provided access to the active database connection.',
      example: '->',
      required: true,
      contract: {
        inputs: {
          connection: { example: '===', required: true },
          meta: { example: '===' },
        },
        exits: {
          success: { example: '===' }
        }
      }
    },

    meta: {
      description: 'Additional adapter-specific metadata to pass to Waterline.',
      example: '==='
    }

  },


  exits: {

    success: {
      description: 'The specified logic ran without incident, and the transaction was committed successfully.',
      outputVariableName: 'result',
      outputDescription: 'The result data sent back by the provided logic (`during`).',
      example: '==='
    },

  },


  fn: function(inputs, exits) {
    var util = require('util');

    if (!util.isObject(env.sails)) {
      return exits.error(new Error('`sails` cannot be accessed; please ensure this machine is being run in a compatible habitat.'));
    }

    var Datastore = env.sails.hooks.orm.datastores[inputs.datastore];
    if (!util.isObject(Datastore)) {
      return exits.error(new Error('Unrecognized datastore (`'+inputs.datastore+'`).  Please check your `config/datastores.js` file to verify that a datastore with this identity exists.'));
    }

    // Start building the transaction.
    var pendingTransaction = env.sails.hooks.orm.transaction(inputs.datastore, function _duringTransaction(T, done) {
      inputs.during({ connection: T.connection, meta: T.meta }).exec(done);
    });

    // Use metadata if provided.
    if (!util.isUndefined(inputs.meta)) {
      pendingTransaction = pendingTransaction.meta(inputs.meta);
    }

    // Now kick everything off.
    // (this begins the transaction, runs the provided logic,
    //  and either commits or rolls back as is appropriate)
    pendingTransaction.exec(function afterwards(err, result) {
      if (err) {
        return exits.error(err);
      }
      return exits.success(result);
    });
    //
    // Note that, behind the scenes, Waterline is doing:
    //
    // Datastore.driver.getConnection({manager: Datastore.manager})
    // Datastore.driver.beginTransaction()
    // _duringTransaction()
    // |
    // |_ Datastore.driver.commitTransaction()
    // |  Datastore.driver.releaseConnection()
    //-or-
    // |_ Datastore.driver.rollbackTransaction()
    //    Datastore.driver.releaseConnection()
  },


};
