module.exports = {


  friendlyName: 'Find',


  description: 'Find records from this model that match the specified criteria, populating associations as necessary.',


  cacheable: true,


  environment: ['sails'],


  inputs: {

    model: {
      friendlyName: 'Model',
      extendedDescription: 'The specified string should be the _identity_ of the model.',
      example: 'user'
    },

    select: {
      example: ['foo'],
      defaultsTo: ['*']
    },

    where: {
      example: {},
      defaultsTo: {}
    },

    limit: {
      example: -1,
      defaultsTo: -1
    },

    skip: {
      example: 0,
      defaultsTo: 0
    },

    sort: {
      example: ['name ASC'],
      defaultsTo: []
    },

    populate: {
      description: 'A set of instructions describing if/how each record should have its associations populated.',
      example: [
        {
          association: 'friends',
          select: ['foo'],
          where: {},
          limit: -1,
          skip: 0,
          sort: ['name ASC']
        }
      ],
      defaultsTo: []
    },

    // If `connection` is omitted, a new connection will be acquired
    // from the manager using `getConnection()`.
    connection: {
      example: '==='
    },
    // (note that if `connection` is not provided, then both `getConnection` AND
    // `releaseConnection()` below are required.  And if either of those functions
    //  is not provided, then `connection` is required.)

    meta: {
      description: 'Additional adapter-specific metadata to pass to Waterline.',
      example: '==='
    }

  },


  exits: {

    success: {
      outputVariableName: 'records',
      outputDescription: 'A list of records matching the specified criteria.',
      example: [{}]
    },

    invalidCriteria: {
      description: 'The provided `where`, `limit`, `skip`, `sort`, and/or `populate` was invalid.'
    }

  },


  fn: function(inputs, exits, env) {
    var util = require('util');

    if (!util.isObject(env.sails)) {
      return exits.error(new Error('ORM cannot be accessed; please ensure this machine is being run in a compatible habitat.'));
    }

    var Model = env.sails.models[inputs.model];
    if (!util.isObject(Model)) {
      return exits.error(new Error('Unrecognized model (`'+inputs.model+'`).  Please check your `api/models/` folder and check that a model with this identity exists.'));
    }

    // TODO: handle `exits.invalidCriteria()`

    // Start building query
    var q = Model.find({
      select: inputs.select,
      where: inputs.where,
      limit: inputs.limit,
      skip: inputs.skip,
      sort: inputs.sort,
    });

    // Use metadata if provided.
    if (!util.isUndefined(inputs.meta)) {
      q = q.meta(inputs.meta);
    }

    // Use existing connection if one was provided.
    if (!util.isUndefined(inputs.connection)) {
      q = q.usingConnection(inputs.connection);
    }

    // Execute query
    q.exec(function afterwards(err, records) {
      if (err) {
        return exits.error(err);
      }
      return exits.success(records);
    });
  },



};
