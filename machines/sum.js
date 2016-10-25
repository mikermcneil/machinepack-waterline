module.exports = {


  friendlyName: 'Sum',


  description: 'Return the sum of the values of a selected attribute for records matching the specified criteria.',


  sideEffects: 'cacheable',


  habitat: 'sails',


  inputs: {

    model: {
      description: 'The type of record to find and sum values for.',
      extendedDescription: 'The specified string should be the _identity_ of the model.',
      example: 'user',
      required: true
    },

    attribute: {
      description: 'The attribute to calculate the sum of.',
      example: 'age',
      required: true
    },

    where: {
      description: 'The criteria to use in determining which records to sum.',
      example: {},
      defaultsTo: {}
    },

    limit: {
      description: 'The maximum number of records to sum.',
      example: 1000,
      defaultsTo: 1000
    },

    skip: {
      description: 'The number of records to skip over before starting to calculate the sum.',
      example: 0,
      defaultsTo: 0
    },

    sort: {
      description: 'The attributes to use in sorting the result set before calculating the sum.',
      extendedDescription: 'By default, records are sorted by primary key value in ascending order.  Specify each sort clause as a separate string containing the name of the attribute to sort by, a space, and the direction (ASC or DESC) to sort in.',
      example: ['name ASC'],
      defaultsTo: []
    },



    // connection: require('../constants/connection.input'),

    // meta: require('../constants/meta.input')

  },


  exits: {

    success: {
      outputFriendlyName: 'Sum',
      outputDescription: 'The sum of the values of the selected attribute for the records matching the specified criteria.',
      outputExample: 123
    },

    // invalidCriteria: {
    //   description: 'The provided `where` was invalid.'
    // },

    invalidAttribute: {
      description: 'The provided attribute was invalid.'
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

    // If "limit" is not a positive, whole number, bounce.
    if (inputs.limit <= 0 || Math.floor(inputs.limit) !== inputs.limit) {
      return exits.error(new Error('The `limit` input must be a positive, whole number.'));
    }

    // If "skip" is not a non-negative, whole number, bounce.
    if (inputs.skip < 0 || Math.floor(inputs.skip) !== inputs.skip) {
      return exits.error(new Error('The `skip` input must be a non-negative, whole number.'));
    }

    // Find the model class indicated by the `inputs.model` value.
    var Model = env.sails.hooks.orm.models[inputs.model];

    // If it's not a recognized model, trigger the `error` exit.
    if (!_.isObject(Model)) {
      return exits.error(new Error('Unrecognized model (`'+inputs.model+'`).  Please check your `api/models/` folder and check that a model with this identity exists.'));
    }

    // If the attribute we're trying to average doesn't exist, trigger the `invalidAttribute` exit.
    if (!Model.attributes[inputs.attribute]) {
      return exits.invalidAttribute();
    }

    // Start building query options.
    var criteria = {
      where: inputs.where,
      limit: inputs.limit,
      skip: inputs.skip
    };

    // Translate sort array into a dictionary.
    criteria.sort = _.reduce(inputs.sort, function(memo, clause) {

      var parts = clause.split(' ');

      // Set default sort to asc
      parts[1] = parts[1] ? parts[1].toLowerCase() : 'asc';

      // Expand criteria.sort into object
      memo[parts[0]] = parts[1];

      return memo;

    }, {});

    // If there's no sort criteria, omit it from the criteria.
    if (_.isEmpty(criteria.sort)) {
      delete criteria.sort;
    }

    // Start building the query.
    var q = Model.find(criteria).sum(inputs.attribute);

    // Use metadata if provided.
    if (!_.isUndefined(inputs.meta)) {
      q = q.meta(inputs.meta);
    }

    // Use existing connection if one was provided.
    if (!_.isUndefined(inputs.connection)) {
      q = q.usingConnection(inputs.connection);
    }

    // Execute the query.
    q.exec(function afterwards(err, sum, meta) {
      // Forward any errors to the `error` exit.
      if (err) {
        // TODO: handle `exits.invalidCriteria()`
        return exits.error(err);
      }
      // Return the sum through the `success` exit.
      // Note the sum currently comes as a dictionary wrapped in an array, e.g.
      // [{age: 113}]
      return exits.success(sum[0][inputs.attribute]);
    });
  }


};

