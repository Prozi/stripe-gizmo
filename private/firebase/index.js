'use strict';

require('paint-console');

const path     = require('path');
const firebase = require('firebase');
const fs       = require('fs');
const express  = require('express');
const router   = express.Router();

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
      initFirebase();
    } else {
      console.error(errorMessage);        
    }
});

function initFirebase() {

  const creditentials = require(path.join(__dirname, '..', '..', creditentialsPath));

  firebase.initializeApp({
    serviceAccount: creditentialsPath,
    databaseURL: `https://${creditentials.project_id}.firebaseio.com`,
  });

  const database = firebase.database();

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

module.exports = router;
