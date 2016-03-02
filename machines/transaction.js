module.exports = {


  friendlyName: 'Transaction',


  description: 'Begin a transaction, perform some logic, then either commit the transaction if everything worked, or roll it back if there were any errors.',


  inputs: {

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

    // `meta` is passed through as the `meta` argin to each of
    // the custom driver functions below:
    // (`getConnection()`, `sendNativeQuery()`, etc.)
    meta: { example: '===' },

    // Either the identity of the datastore to use
    datastore: { example: 'larrysDbCluster' },
    //-AND/OR-
    //
    // Any of these things:
    // (if `datastore` is provided, these are optional. If any of
    //  them are ALSO provided, then they are used as overrides)
    createManager: { example: '->' },
    getConnection: { example: '->' },
    beginTransaction: { example: '->' },
    rollbackTransaction: { example: '->' },
    commitTransaction: { example: '->' },
    releaseConnection: { example: '->' },
    destroyManager: { example: '->' },

    // `manager` is optional (sometimes). When this is called from n WL core,
    // `manager` is passed in if you provide `.usingManager(...)` when building
    // your query as a deferred object. If `connection` was explicitly provided,
    // then `manager` is completely ignored.
    //
    // If `manager` is omitted, a new manager will be created
    // using `createManager()` and destroyed with `destroyManager()`
    // when this operation completes (whether it is successful or not).
    manager: { example: '===' },
    //
    // (note that if `connection` is provided, then `manager` and the two related
    //  functions are completely ignored.  On the other hand, if connection is NOT
    //  provided, then `manager`, `createManager` and/or `destroyManager` are used.
    //
    //  If `manager` is not provided, then both `createManager` AND
    // `destroyManager()` below are required.  And if either of those functions
    //  is not provided, then `manager` is required.)

    // `connection` is optional-- e.g. in WL core, it is passed in if
    // you provide `.usingConnection(...)` when building your query
    // as a deferred object.
    //
    // If `connection` is omitted, a new connection will be acquired
    // from the manager using `getConnection()`.
    connection: { example: '===' },
    // (note that if `connection` is not provided, then both `getConnection` AND
    // `releaseConnection()` below are required.  And if either of those functions
    //  is not provided, then `connection` is required.)

  },


  exits: {

    success: {
      description: 'The specified logic ran without incident, and the transaction was committed successfully.',
      outputVariableName: 'report',
      outputDescription: 'The `result` property is the result data sent back by the provided logic (`during`).  The `meta` property is reserved for custom driver-specific extensions.',
      example: {
        result: '*',
        meta: '==='
      }
    },

  },


  fn: function(inputs, exits) {
    return exits.success();
  },



};
