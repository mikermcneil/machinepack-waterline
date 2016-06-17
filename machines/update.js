module.exports = {


  friendlyName: 'Update',


  description: 'Find records from this model that match the specified criteria, and update them with the specified attributes.',


  cacheable: true,


  habitat: 'sails',


  inputs: {

    model: require('../constants/model.input'),

    select: {
      example: ['foo'],
      defaultsTo: ['*']
    },

    where: {
      example: {},
      defaultsTo: {}
    },

    attributes: {
      friendlyName: 'Attributes',
      description: 'The attributes that the new record should have',
      example: '*'
    },

    connection: require('../constants/connection.input'),

    meta: require('../constants/meta.input')

  },


  exits: {

    success: {
      description: 'Done.',
      example: {
        numRecordsUpdated: 123
      }
    },

    invalidAttributes: require('../constants/invalidAttributes.exit'),

    invalidCriteria: {
      description: 'The provided `where` was invalid.'
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
    var q = Model.update(inputs.where, inputs.attributes);

    // Use metadata if provided.
    if (!_isUndefined(inputs.meta)) {
      q = q.meta(inputs.meta);
    }

    // Use existing connection if one was provided.
    if (!_isUndefined(inputs.connection)) {
      q = q.usingConnection(inputs.connection);
    }

    // Execute query
    q.exec(function afterwards(err, recordsOrNumRecords, meta) {
      if (err) {
        // TODO: handle `exits.invalidCriteria()`
        // TODO: handle `exits.invalidAttributes()`
        return exits.error(err);
      }
      return exits.success({
        numRecordsUpdated: _isObject(recordsOrNumRecords) ? recordsOrNumRecords.length : recordsOrNumRecords
      });
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

