module.exports = {


  friendlyName: 'Destroy',


  description: 'Delete records from this model that match the specified criteria.',


  sideEffects: 'cacheable',


  habitat: 'sails',


  inputs: {

    model: require('../constants/model.input'),

    where: {
      example: {},
      defaultsTo: {}
    },

    // connection: require('../constants/connection.input'),

    // meta: require('../constants/meta.input')

  },


  exits: {

    success: {
      outputFriendlyName: 'Number of deleted records',
      outputDescription: 'The number of records that were deleted.',
      outputExample: 123
    },

    // invalidCriteria: {
    //   description: 'The provided `where` was invalid.'
    // }

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
    var q = Model.destroy({
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

    // Execute the query.
    q.exec(function afterwards(err, recordsOrNumRecords, meta) {
      // Forward any errors to the `error` exit.
      if (err) {
        // TODO: handle `exits.invalidCriteria()`
        return exits.error(err);
      }
      // Determine the number of records that were deleted.
      var numRecordsDeleted = _isObject(recordsOrNumRecords) ? recordsOrNumRecords.length : recordsOrNumRecords;
      // Return the number of deleted records through the `success` exit.
      return exits.success(numRecordsDeleted);
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

