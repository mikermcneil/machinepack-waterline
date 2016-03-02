module.exports = {


  friendlyName: 'Connect',


  description: 'Lease a database connection, perform some logic, then release it back from whence it came.',


  inputs: {

    during: {
      description: 'A function with custom logic to run once the connection is established.',
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
    releaseConnection: { example: '->' },
    destroyManager: { example: '->' },

    // `manager` is optional (sometimes). When this is called from WL core,
    // `manager` is passed in if you provide `.usingManager(...)` when building
    // your query as a deferred object.
    //
    // If `manager` is omitted, a new manager will be created
    // using `createManager()` and destroyed with `destroyManager()`
    // when this operation completes (whether it is successful or not).
    manager: { example: '===' }
    //
    // (note that if `manager` is not provided, then both `createManager` AND
    // `destroyManager()` below are required.  And if either of those functions
    //  is not provided, then `manager` is required.)

  },


  exits: {

    success: {
      description: 'The connection was successful and the specified logic ran without incident.',
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
