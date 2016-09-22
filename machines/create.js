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

    pkSchema: {
      friendlyName: 'Primary key schema',
      description: 'An example primary key value to use for narrowing down whether to expect a number or a string.',
      extendedDescription: 'If specified, this must be set to either a number, a miscellaneous string, or "*" to indicate the possibility of either.',
      example: '*',
      defaultsTo: '*',
      isExemplar: true
    },

    // connection: require('../constants/connection.input'),

    // meta: require('../constants/meta.input')

  },


  exits: {

    success: {
      outputFriendlyName: 'Insert ID',
      outputDescription: 'The ID (primary key) of the newly-created record.  To set the primary key type (number or string), set the \'Primary key schema\' input.',

      like: 'pkSchema'
    },

    // invalidAttributes: require('../constants/invalidAttributes.exit')
  },


  fn: function(inputs, exits, env) {

    // Import lodash.
    var _ = require('lodash');
    
    // Import rttc
    var rttc = require('rttc');
    
    // Infer a type schema from the provided exemplar schema,
    // then ensure it is either "*", a miscellaneous string, or
    // a number.  Note that other special RTTC syntax is not allowed
    // (e.g. "===" / "->").
    var pkTypeSchema;
    try {
      pkTypeSchema = rttc.infer(inputs.pkSchema);
    } catch (e) {
      throw new Error('The provided "Primary key schema" (`'+inputs.pkSchema+'`) is invalid.  It cannot be interpreted as an RTTC exemplar.  Details: '+e.stack); }
    }
    
    if (pkTypeSchema === 'string' || pkTypeSchema === 'number' || pkTypeSchema === 'json') {
      // OK- good to go!  Continue on below.
    }
    else if (pkTypeSchema === 'lamda') {
      throw new Error('The provided "Primary key schema" (`'+inputs.pkSchema+'`) is invalid.  It is a special symbol that indicates a "function", but a primary key should be either a string or a number.'); }
    }
    else if (pkTypeSchema === 'ref') {
      throw new Error('The provided "Primary key schema" (`'+inputs.pkSchema+'`) is invalid.  It is a special symbol that indicates a "ref" (any generic mutable reference), but a primary key should be either a string or a number.'); }
    }
    else {
      throw new Error('The provided "Primary key schema" (`'+inputs.pkSchema+'`) is invalid.  It must be either a string or a number.'); }
    }
    //>-

    // If we don't have a Sails app in our environment, bail early through the `error` exit.
    if (!_isObject(env.sails) || env.sails.constructor.name !== 'Sails') {
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
