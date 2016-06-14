'use strict';

module.exports = (app) => {

  const fs   = require('fs');
  const path = require('path');

  const stripeApiKeyPath = path.join(__dirname, '..', '..', 'stripe.api.key.json');

  fs.exists(stripeApiKeyPath, (exists) => {
    if (exists) {
      const stripeApiKey = require(stripeApiKeyPath).apiKey;
      const stripe = require('stripe')(stripeApiKey);
      onSuccess(stripe);
    } else {
      console.log('you need to put PROJECT_ROOT/stripe.api.key.json with {apiKey:"your api key"}');
    }
  });

  function onSuccess(stripe) {

    console.log('has stripe');

    stripe.customers.create({
      email: 'foo-customer@example.com'
    }).then(function(customer) {
      return stripe.charges.create({
        amount: 1600,
        currency: 'usd',
        customer: customer.id
      });
    }).then(function(charge) {
      // New charge created on a new customer
    }).catch(function(err) {
      // Deal with an error
    });
  }

};