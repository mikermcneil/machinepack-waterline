module.exports = {


  friendlyName: 'Remove from collection',


  description: 'Remove the specified IDs from the associated collection of this record.',


  habitat: 'sails',


  inputs: {

    model: require('../constants/model.input'),

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

    associatedIdsToRemove: {
      description: 'The IDs to remove from this record\'s associated collection.',
      extendedDescription: 'Must be an array of numbers or strings; e.g. `[\'507f191e810c19729de860ea\']`',
      example: ['*'],
      required: true
    },

    // connection: require('../constants/connection.input'),

    // meta: require('../constants/meta.input')

  },


  exits: {

    recordNotFound: {
      description: 'The primary record (i.e. with the specified `recordId`) could not be found.'
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

    // Check to ensure `inputs.association` is a recognized collection association
    if (!_isObject(Model.attributes[inputs.association])) {
      return exits.error(new Error('Unrecognized association (`'+inputs.association+'`).  Please check that a "collection" association named `'+inputs.association+'` is defined as an attribute of this model (`'+inputs.model+'`).'));
    }

    // If the association is a model, not a collection, trigger the `error` exit.
    else if (!Model.attributes[inputs.association].collection) {
      return exits.error(new Error('Invalid association (`'+inputs.association+'`).  This method is only compatible with "collection" associations.'));
    }

    // Find the record we want to remove associated records from.
    Model.findOne(inputs.recordId).exec(function afterFindOne(err, record) {
      // Forward any errors to the `error` exit.
      if (err) {
        return exits.error(err);
      }
      // If the record could not be found, trigger the `notFound` exit.
      if (!record) {
        return exits.recordNotFound();
      }
      // Remove the requested IDs from the specified collection.
      record[inputs.association].remove(inputs.associatedIdsToRemove);
      // Save the record.
      record.save(function afterwards(err) {
        // Forward any errors to the `error` exit.
        if (err) {
          return exits.error(err);
        }
        // Return via the `success` exit.
        return exits.success();
      });
    });

    // // Start building the query.
    // var q = Model.removeFromCollection(inputs.recordId, inputs.association, inputs.associatedIdsToRemove);

    // // Use metadata if provided.
    // if (!_isUndefined(inputs.meta)) {
    //   q = q.meta(inputs.meta);
    // }

    // // Use existing connection if one was provided.
    // if (!_isUndefined(inputs.connection)) {
    //   q = q.usingConnection(inputs.connection);
    // }

    // // Execute the query.
    // q.exec(function afterwards(err) {
    //   // Forward any errors to the `error` exit.
    //   if (err) {
    //     // TODO: negotiate error in order to trigger `exits.recordNotFound()`
    //     return exits.error(err);
    //   }
    //   // Return through the `success` exit.
    //   return exits.success();
    // });
  }


};
