module.exports = {


  friendlyName: 'Find',


  description: 'Find records from this model that match the specified criteria, and optionally populate their associations.',


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
      description: 'An example of the schema (i.e. attributes) of the records that should be returned.',
      example: {},
      defaultsTo: {},
      isExemplar: true
    },

    select: {
      example: ['foo'],
      description: 'This input is not currently supported.'
    },

    where: {
      description: 'The criteria to use in determining which records to return.',
      example: {},
      defaultsTo: {}
    },

    limit: {
      description: 'The maximum number of records to return.',
      example: 1000,
      defaultsTo: 1000
    },

    skip: {
      description: 'The number of records to skip over before starting to returning results.',
      example: 0,
      defaultsTo: 0
    },

    sort: {
      description: 'The attributes to use in sorting the result set.',
      extendedDescription: 'By default, returned records are sorted by primary key value in ascending order.  Specify each sort clause as a separate string containing the name of the attribute to sort by, a space, and the direction (ASC or DESC) to sort in.',
      example: ['name ASC'],
      defaultsTo: []
    },

    populate: {
      description: 'An array of assocations to populate.',
      extendedDescription: 'Each record returned in the result array will also contain related data according to the specified criteria.',
      example: [
        {
          association: 'friends',
          select: ['foo'],
          where: {},
          limit: 1000,
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

    // Temporarily throw if `select` feature is utilized.
    // This will be available in the Waterline that ships w/ Sails 1.0.
    if (inputs.select || _.any(inputs.populate, function(p) {return p.select.length;})) {
      throw new Error('The `select` feature is currently not supported.');
    }

    // Find the model class indicated by the `inputs.model` value.
    var Model = env.sails.hooks.orm.models[inputs.model];

    // If it's not a recognized model, trigger the `error` exit.
    if (!_.isObject(Model)) {
      return exits.error(new Error('Unrecognized model (`'+inputs.model+'`).  Please check your `api/models/` folder and check that a model with this identity exists.'));
    }

    // Start building query options.
    var criteria = {
      where: inputs.where,
      limit: inputs.limit,
      skip: inputs.skip,
      sort: inputs.sort
    };

    // If we want to select only certain attributes, add that
    // to the query options.
    if (inputs.select) {
      criteria.select = inputs.select;
    }

    // Start building the query.
    var q = Model.find(criteria);

    // Use metadata if provided.
    if (!_.isUndefined(inputs.meta)) {
      q = q.meta(inputs.meta);
    }

    // Use existing connection if one was provided.
    if (!_.isUndefined(inputs.connection)) {
      q = q.usingConnection(inputs.connection);
    }

    // Add in populate instructions, if provided.
    inputs.populate.forEach(function (pInstruction){

      // Building query options for the association.
      var criteria = _.omit(pInstruction, 'association');
      if (_.isEmpty(criteria.select)) {delete criteria.select;}
      if (_.isEmpty(criteria.where)) {delete criteria.where;}
      if (_.isEmpty(criteria.sort)) {delete criteria.sort;}
      q = q.populate(pInstruction.association, criteria);

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

