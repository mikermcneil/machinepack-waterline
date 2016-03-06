module.exports = {


  friendlyName: 'Remove from collection',


  description: 'Remove the specified ids from the associated collections of matching records.',


  environment: ['orm'],


  inputs: {

  },


  exits: {

    success: {
      description: 'Done.'
    },

  },


  fn: function(inputs, exits) {
    return exits.error(new Error('Not implemented yet'));
  }


};
