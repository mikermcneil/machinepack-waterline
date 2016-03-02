module.exports = {


  friendlyName: 'Query',


  description: 'Compile a radar query statement into the native dialect for a database, then send the native query.',


  inputs: {

    statement: {
      description: 'A radar query statement to compile and send to the database as a native query.',
      example: {},
      required: true
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
    compileStatement: { example: '->' },
    sendNativeQuery: { example: '->' },
    parseNativeQueryError: { example: '->' },
    parseNativeQueryResult: { example: '->' },
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
      description: 'The query was compiled and executed successfully.',
      outputVariableName: 'report',
      outputDescription: 'The `result` property is the result data the database sent back.  The `meta` property is reserved for custom driver-specific extensions.',
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
