module.exports = {


  friendlyName: 'Replace collections',


  description: 'Replace the associated collections of matching records.',


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
  },



};
