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

class Order {
  constructor (id, value, database) {
    this.id = id;
    this.database = database;
    if (!value.stripe_charge_id) {
      this.setPayment(value.payment);
      this.setProduct(value.product);
      this.setCustomer(value.customer);
      this.setCustomerId(value.stripe_customer_id);
      this.onInit();
    } else {
      console.log('order', this.id, 'has charge id', value.stripe_charge_id);
    }
  }
  setCustomer(customer) {
    this.customer = {
      email  : customer.email,
      metadata: {
        name : customer.name
      }
    };
  }
  setCustomerId(customerId) {
    this.customer.id = customerId;
  }
  setPayment(payment) {
    const split = payment.details.expiry.split('/');
    this.payment = {
      object    : 'card',
      exp_month : split[0],
      exp_year  : split[1],
      number    : payment.details.number,
      cvc       : payment.details.cvc
    };
  }
  setProduct(product) {
    this.product = product;
  }
  onInit () {
    console.log('loaded order', this.id);
    this.createStripeCustomer();
  }
  createStripeCustomer () {
    if (!this.customer.id) {
      stripe.customers.create(this.customer).then((customer) => {
        this.customer.id = customer.id;
        this.database.ref(`/orders/${this.id}/stripe_customer_id`).set(customer.id);
        console.log('order', this.id, 'created customer', this.customer.id);
        this.createStripePayment();
      }).catch((err) => {
        console.log('createStripeCustomer create', err);
      });
    }
  }
  createStripePayment () {
    stripe.customers.createSource(this.customer.id, { 
      source: this.payment 
    }).then((payment) => {
      console.log('order', this.id, 'created payment for', this.customer.id);
      this.createStripeCharge();
    }).catch((err) => {
      console.log('createStripePayment create', err);
    });
  }
  createStripeCharge () {
    this.charge = {
      amount   : parseFloat(this.product.price) * 100,
      currency : 'gbp',
      customer : this.customer.id
    }
    stripe.charges.create(this.charge).then((charge) => {
      console.log('order', this.id, 'created charge for', this.customer.id);
      this.database.ref(`/orders/${this.id}/stripe_charge_id`).set(charge.id);
      console.log('order', this.id, 'charge id stored in firebase');
    }).catch((err) => {
      console.log('createStripeCharge create', err);
    });
  }
}

function onSuccess() {

  const creditentials = require(path.join(__dirname, '..', '..', '..', creditentialsPath));

  firebase.initializeApp({
    serviceAccount: creditentialsPath,
    databaseURL: `https://${creditentials.project_id}.firebaseio.com`,
  });

  const database = firebase.database();

  database.ref('/orders').on('child_added', function(snapshot) {
    new Order(snapshot.key, snapshot.val(), database);
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

module.exports = router;
