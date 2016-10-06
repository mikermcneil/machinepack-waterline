module.exports = {


  friendlyName: 'Find one',


  description: 'Find a record that matches the specified criteria, and optionally populate its associations.',


  sideEffects: 'cacheable',


  habitat: 'sails',


  inputs: {

    model: {
      description: 'The type of record to find.',
      extendedDescription: 'The specified string should be the _identity_ of the model.',
      example: 'user',
      required: true
    },

    schema: {
      friendlyName: 'Example record',
      description: 'An example of the schema (i.e. attributes) of the record that should be returned.',
      example: {},
      defaultsTo: {},
      isExemplar: true
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
      description: 'An array of assocations to populate.',
      extendedDescription: 'Each record returned in the result array will also contain related data according to these criteria.',
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

    // connection: require('../constants/connection.input'),

    // meta: require('../constants/meta.input')

  },


  exits: {

    success: {
      outputFriendlyName: 'Found record',
      outputDescription: 'The first record matching the specified criteria.',
      like: 'schema'
    },

    // invalidCriteria: {
    //   description: 'The provided `select`, `where` and/or `populate` was invalid.'
    // },

    notFound: {
      description: 'No record matching the specified criteria could be found.'
    }

  },


  fn: function(inputs, exits, env) {

    // Import Lodash.
    var _ = require('lodash');

    // If we don't have a Sails app in our environment, bail early through the `error` exit.
    if (!_.isObject(env.sails) || env.sails.constructor.name !== 'Sails') {
      return exits.error(new Error('A valid Sails app must be provided through `.setEnv()` in order to use this machine.'));
    }

    // If we can't access the ORM, leave through the `error` exit.
    if (!_.isObject(env.sails.hooks.orm)) {
      return exits.error(new Error('`sails.hooks.orm` cannot be accessed; please ensure this machine is being run in a compatible habitat.'));
    }

    // Find the model class indicated by the `inputs.model` value.
    var Model = env.sails.hooks.orm.models[inputs.model];

    // If it's not a recognized model, trigger the `error` exit.
    if (!_.isObject(Model)) {
      return exits.error(new Error('Unrecognized model (`'+inputs.model+'`).  Please check your `api/models/` folder and check that a model with this identity exists.'));
    }

    // Start building the query.
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
    if (!_.isUndefined(inputs.meta)) {
      q = q.meta(inputs.meta);
    }

    // Use existing connection if one was provided.
    if (!_.isUndefined(inputs.connection)) {
      q = q.usingConnection(inputs.connection);
    }

    // Execute the query.
    q.exec(function afterwards(err, record, meta) {
      // Forward any errors to the `error` exit.
      if (err) {
        // TODO: handle `exits.invalidCriteria()`
        return exits.error(err);
      }
      // If no record was found, return through the `notFound` exit.
      if (!record) {
        return exits.notFound();
      }
      // Otherwise return the record through the `success` exit.
      return exits.success(record);
    });
  }


};

