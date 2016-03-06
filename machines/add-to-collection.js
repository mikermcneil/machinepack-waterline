module.exports = {


  friendlyName: 'Add to collection',


  description: 'Add the specified IDs to the associated collection of this record.',


  environment: ['orm'],


  inputs: {

    model: {
      friendlyName: 'Model',
      extendedDescription: 'The specified string should be the _identity_ of the model.',
      example: 'user',
      required: true
    },

    recordId: {
      description: 'The ID of this record.',
      extendedDescription: 'Must be a number or string; e.g. `\'507f191e810c19729de860ea\'`',
      example: '*',
      required: true
    },

    association: {
      description: 'The name of the association.',
      example: 'locations',
      required: true
    },

    associatedIdsToAdd: {
      description: 'The IDs to add to this record\'s associated collection.',
      extendedDescription: 'Must be an array of numbers or strings; e.g. `[\'507f191e810c19729de860ea\']`',
      example: ['*'],
      required: true
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
      description: 'Done.'
    },

    recordNotFound: {
      description: 'The primary record (i.e. with the specified `recordId`) could not be found.'
    }

  },


  fn: function(inputs, exits) {
    var util = require('util');

    if (!util.isObject(env.orm)) {
      return exits.error(new Error('`orm` cannot be accessed; please ensure this machine is being run in a compatible habitat.'));
    }

    var Model = env.orm.models[inputs.model];
    if (!util.isObject(Model)) {
      return exits.error(new Error('Unrecognized model (`'+inputs.model+'`).  Please check your `api/models/` folder and check that a model with this identity exists.'));
    }

    // TODO: check to ensure `inputs.association` is a recognized association

    // Start building query
    var q = Model.addToCollection(inputs.recordId, inputs.association, inputs.associatedIdsToAdd);

    // Use metadata if provided.
    if (!util.isUndefined(inputs.meta)) {
      q = q.meta(inputs.meta);
    }

    // Use existing connection if one was provided.
    if (!util.isUndefined(inputs.connection)) {
      q = q.usingConnection(inputs.connection);
    }

    // Execute query
    q.exec(function afterwards(err) {
      if (err) {
        // TODO: negotiate error in order to trigger `exits.recordNotFound()`
        return exits.error(err);
      }
      return exits.success();
    });
  }


};
