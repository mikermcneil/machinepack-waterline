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
      description: 'An array of assocations to populate.',
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

    Model.find({
      select: inputs.select,
      where: inputs.where,
      limit: inputs.limit,
      skip: inputs.skip,
      sort: inputs.sort,
    }).exec(function (err, records) {
      if (err) {
        return exits.error(err);
      }
      return exits.success(records);
    });
  },



};
