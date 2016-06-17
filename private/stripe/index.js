'use strict';

// stripe module
// inits stripe or prints error
// @returns stripe || undefined

const fs   = require('fs');
const path = require('path');

const stripeApiKeyPath = path.join(__dirname, '..', '..', 'stripe.api.key.json');

if (fs.existsSync(stripeApiKeyPath)) {
  const stripeApiKey = require(stripeApiKeyPath).apiKey;
  console.log('has stripe');
  module.exports = require('stripe')(stripeApiKey);
} else {
  console.log('you need to put PROJECT_ROOT/stripe.api.key.json with {apiKey:"your api key"}');
}

