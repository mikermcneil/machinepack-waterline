module.exports = {


  friendlyName: 'Find one',


  description: 'Find a record that matches the specified criteria, and optionally populate its associations.',


  cacheable: true,


  environment: ['orm'],


  inputs: {

    model: {
      friendlyName: 'Model',
      extendedDescription: 'The specified string should be the _identity_ of the model.',
      example: 'user',
      required: true
    },

    select: {
      example: ['foo'],
      defaultsTo: ['*']
    },

    where: {
      example: {},
      defaultsTo: {}
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

    connection: {
      description: 'An existing connection to use (otherwise, by default, a new connection is acquired from the datastore).',
      example: '==='
    },

    meta: {
      description: 'Additional adapter-specific metadata to pass to Waterline.',
      example: '==='
    }

  },


  exits: {

    success: {
      outputVariableName: 'record',
      outputDescription: 'The first record matching the specified criteria.',
      example: {}
    },

    invalidCriteria: {
      description: 'The provided `select`, `where` and/or `populate` was invalid.'
    },

    notFound: {
      description: 'No record matching the specified criteria could be found.'
    }

  },


  fn: function(inputs, exits, env) {
    var util = require('util');

    if (!util.isObject(env.orm)) {
      return exits.error(new Error('`orm` cannot be accessed; please ensure this machine is being run in a compatible habitat.'));
    }

    var Model = env.orm.models[inputs.model];
    if (!util.isObject(Model)) {
      return exits.error(new Error('Unrecognized model (`'+inputs.model+'`).  Please check your `api/models/` folder and check that a model with this identity exists.'));
    }

    // TODO: handle `exits.invalidCriteria()`

    // Start building query
    var q = Model.findOne({
      select: inputs.select,
      where: inputs.where
    });

    // Add in populate instructions, if provided.
    inputs.populate.forEach(function (pInstruction){
      q = q.populate(pInstruction.association, {
        select: pInstruction.select,
        where: pInstruction.where,
        limit: pInstruction.limit,
        skip: pInstruction.skip,
        sort: pInstruction.sort,
      });
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
    q.exec(function afterwards(err, record, meta) {
      if (err) {
        return exits.error(err);
      }
      if (!record) {
        return exits.notFound();
      }
      return exits.success(record);
    });
  }


};

