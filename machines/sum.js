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

    where: {
      example: {},
      defaultsTo: {}
    },

    attribute: {
      example: 'age',
      required: true
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

    // Start building the query.
    var q = Model.find(inputs.where).sum(inputs.attribute);

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

