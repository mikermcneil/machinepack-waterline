module.exports = {


  friendlyName: 'Find',


  description: 'Find records from this model that match the specified criteria, and optionally populate their associations.',


  sideEffects: 'cacheable',


  habitat: 'sails',


  inputs: {

    model: require('../constants/model.input'),

    schema: {
      friendlyName: 'Model schema',
      description: 'An example of the model schema (i.e. its attributes).',
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
      outputFriendlyName: 'Found records',
      outputDescription: 'A list of records matching the specified criteria.',
      getExample: function (inputs, env) {
        return [env.rttc.coerceExemplar(inputs.schema, false, false, true)];
      }
    },

    invalidCriteria: {
      description: 'The provided `select`, `where`, `limit`, `skip`, `sort`, and/or `populate` was invalid.'
    }

  },


  fn: function(inputs, exits, env) {

    // Import `isObject` and `isUndefined` Lodash functions.
    var _isObject = require('lodash.isobject');
    var _isUndefined = require('lodash.isundefined');

    // If we don't have a Sails app in our environment, bail early through the `error` exit.
    if (!_isObject(env.sails)) {
      return exits.error(new Error('A valid Sails app must be provided through `.setEnv()` in order to use this machine.'));
    }

    // If we can't access the ORM, leave through the `error` exit.
    if (!_isObject(env.sails.hooks.orm)) {
      return exits.error(new Error('`sails.hooks.orm` cannot be accessed; please ensure this machine is being run in a compatible habitat.'));
    }

    // Find the model class indicated by the `inputs.model` value.
    var Model = env.sails.hooks.orm.models[inputs.model];

    // If it's not a recognized model, trigger the `error` exit.
    if (!_isObject(Model)) {
      return exits.error(new Error('Unrecognized model (`'+inputs.model+'`).  Please check your `api/models/` folder and check that a model with this identity exists.'));
    }

    // Start building the query.
    var q = Model.find({
      select: inputs.select,
      where: inputs.where,
      limit: inputs.limit,
      skip: inputs.skip,
      sort: inputs.sort,
    });

    // Use metadata if provided.
    if (!_isUndefined(inputs.meta)) {
      q = q.meta(inputs.meta);
    }

    // Use existing connection if one was provided.
    if (!_isUndefined(inputs.connection)) {
      q = q.usingConnection(inputs.connection);
    }

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

    // Execute the query.
    q.exec(function afterwards(err, records, meta) {
      // Forward any errors to the `error` exit.
      if (err) {
        // TODO: handle `exits.invalidCriteria()`
        return exits.error(err);
      }
      // Output any found records (or an empty array) through the `success` exit.
      return exits.success(records);
    });
    //
    // Note that, behind the scenes, Waterline is calling out to one or more adapters,
    // each of which is doing something like:
    //
    // driver.getConnection({manager: manager})
    // driver.compileQuery()
    // driver.sendNativeQuery()
    // |
    // |_ driver.parseNativeQueryResult()
    // |  driver.releaseConnection()
    //-or-
    // |_ driver.parseNativeQueryError()
    //    driver.releaseConnection()
  },



};

