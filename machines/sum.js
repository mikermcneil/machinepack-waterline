module.exports = {


  friendlyName: 'Sum',


  description: 'Return the sum of the values of a selected attribute for records matching the specified criteria.',


  sideEffects: 'cacheable',


  habitat: 'sails',


  inputs: {

    model: require('../constants/model.input'),

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

    invalidCriteria: {
      description: 'The provided `where` was invalid.'
    },

    invalidAttribute: {
      description: 'The provided attribute was invalid.'
    }

  },


  fn: function(inputs, exits, env) {
    var _isObject = require('lodash.isobject');
    var _isUndefined = require('lodash.isundefined');

    if (!_isObject(env.sails.hooks.orm)) {
      return exits.error(new Error('`sails.hooks.orm` cannot be accessed; please ensure this machine is being run in a compatible habitat.'));
    }

    var Model = env.sails.hooks.orm.models[inputs.model];
    if (!_isObject(Model)) {
      return exits.error(new Error('Unrecognized model (`'+inputs.model+'`).  Please check your `api/models/` folder and check that a model with this identity exists.'));
    }

    // Start building query
    var q = Model.sum({
      where: inputs.where
    });

    // Use metadata if provided.
    if (!_isUndefined(inputs.meta)) {
      q = q.meta(inputs.meta);
    }

    // Use existing connection if one was provided.
    if (!_isUndefined(inputs.connection)) {
      q = q.usingConnection(inputs.connection);
    }

    // Execute query
    q.exec(function afterwards(err, sum, meta) {
      if (err) {
        // TODO: handle `exits.invalidCriteria()`
        return exits.error(err);
      }
      return exits.success(sum);
    });
  }


};

