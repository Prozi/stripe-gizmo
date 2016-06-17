'use strict';

require('paint-console');

const path     = require('path');
const firebase = require('firebase');
const fs       = require('fs');
const express  = require('express');
const router   = express.Router();

// get stripe as module
const stripe   = require(path.join(__dirname, '..', '..', 'stripe'));

const creditentialsPath = 'firebase.creditentials.json';
const where             = `inside project root: '${creditentialsPath}'`;

const errorMessage = `
  You should put your firebase creditentials from json:
  https://firebase.google.com/docs/auth/web/custom-auth#before-you-begin
  ${where}
`;

const successMessage = `
  Success: Initialized firebase.
  Found firebase creditentials
  ${where}
`;

fs.exists(creditentialsPath, (exists) => {
    if (exists) {
      onSuccess();
    } else {
      onError();
    }
});

function onError() {
  console.error(errorMessage);
}

function onSuccess() {

  const creditentials = require(path.join(__dirname, '..', '..', '..', creditentialsPath));

  firebase.initializeApp({
    serviceAccount: creditentialsPath,
    databaseURL: `https://${creditentials.project_id}.firebaseio.com`,
  });

  const database = firebase.database();

  database.ref('/orders').on('child_added', function(snapshot) {
    console.log(snapshot.key, snapshot.val());
  });

  // get stats
  router.get('/orders', (req, res) => {
    let orders = database.ref('/orders');
    orders.on('value', (snapshot) => {
      orders.off('value');
      res.send(snapshot.val());
    });
  });

  router.post('/orders', (req, res) => {
    let order  = req.body.order || {};
    let orders = database.ref('/orders');
    orders.on('value', function(snapshot) {
      orders.off('value');
      orders.child(snapshot.numChildren() + 1).set(order);
    });
    res.send(order);
  });

  console.info(successMessage);

}

/*
  test stripe as module

  stripe.customers.create({
    email: 'welcome@example.com'
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
*/

module.exports = router;
