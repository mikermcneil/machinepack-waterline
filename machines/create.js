module.exports = {


  friendlyName: 'Create',


  description: 'Create a new record for this model with the specified attributes.',


  habitat: 'sails',


  inputs: {

    model: require('../constants/model.input'),

    attributes: {
      description: 'The attributes that the new record should have.',
      example: {}
    },

    // connection: require('../constants/connection.input'),

    // meta: require('../constants/meta.input')

  },


  exits: {

    success: {
      outputFriendlyName: 'Insert ID',
      outputDescription: 'The ID (primary key) of the newly-created record.',
      outputExample: '*'
    },

    // invalidAttributes: require('../constants/invalidAttributes.exit')
  },


  fn: function(inputs, exits, env) {

    // Import `isObject` and `isUndefined` Lodash functions.
    var _isObject = require('lodash.isobject');
    var _isUndefined = require('lodash.isundefined');

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
    var q = Model.create(inputs.attributes);

    // Use metadata if provided.
    if (!_isUndefined(inputs.meta)) {
      q = q.meta(inputs.meta);
    }

    // Use existing connection if one was provided.
    if (!_isUndefined(inputs.connection)) {
      q = q.usingConnection(inputs.connection);
    }

    // Execute the query.
    q.exec(function afterwards(err, recordOrPk, meta) {
      // Forward any errors to the `error` exit.
      if (err) {
        // TODO: handle `exits.invalidAttributes()`
        return exits.error(err);
      }

      // Get the primary key of the newly-inserted record.
      var pk = _isObject(recordOrPk) ? recordOrPk[Model.primaryKey] : recordOrPk;

      // Return the primary key through the `success` exit.
      return exits.success(pk);

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
