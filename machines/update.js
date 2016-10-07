module.exports = {


  friendlyName: 'Update',


  description: 'Find records from this model that match the specified criteria, and update them with the specified attributes.',


  sideEffects: 'idempotent',


  habitat: 'sails',


  inputs: {

    model: {
      description: 'The type of record to update.',
      extendedDescription: 'The specified string should be the _identity_ of the model.',
      example: 'user',
      required: true
    },

    where: {
      example: {},
      defaultsTo: {}
    },

    attributes: {
      description: 'The attributes that the new record should have.',
      example: '*'
    },

    // connection: require('../constants/connection.input'),

    // meta: require('../constants/meta.input')

  },


  exits: {

    success: {
      outputFriendlyName: 'Number of updated records',
      outputDescription: 'The number of records that were updated.',
      outputExample: 123
    },

    // invalidAttributes: require('../constants/invalidAttributes.exit'),

    // invalidCriteria: {
    //   description: 'The provided `where` was invalid.'
    // }

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
    var q = Model.update(inputs.where, inputs.attributes);

    // Use metadata if provided.
    if (!_.isUndefined(inputs.meta)) {
      q = q.meta(inputs.meta);
    }

    // Use existing connection if one was provided.
    if (!_.isUndefined(inputs.connection)) {
      q = q.usingConnection(inputs.connection);
    }

    // Execute the query.
    q.exec(function afterwards(err, recordsOrNumRecords, meta) {
      // Forward any errors to the `error` exit.
      if (err) {
        // TODO: handle `exits.invalidCriteria()`
        // TODO: handle `exits.invalidAttributes()`
        return exits.error(err);
      }
      // Determine the number of records that were updated (if any).
      var numRecordsUpdated = _.isObject(recordsOrNumRecords) ? recordsOrNumRecords.length : recordsOrNumRecords;
      // Return the number of updated records through the `success` exit.
      return exits.success(numRecordsUpdated);
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

