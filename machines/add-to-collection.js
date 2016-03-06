module.exports = {


  friendlyName: 'Add to collection',


  description: 'Add the specified ids to the associated collections of matching records.',


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
