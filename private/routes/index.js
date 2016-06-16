'use strict';

const fs      = require('fs');
const express = require('express');
const request = require('request');
const path    = require('path');
const router  = express.Router();

const orderPath = path.join(__dirname, '..', '..', 'stripe.order.json');

let order = {};

fs.exists(orderPath, (exists) => {
  if (exists) {
  	order = require(orderPath);
  } else {
  	console.log('not found PROJECT_ROOT/stripe.order.json');
  }
});

router.get('/putorder', (req, res, next) => {
  request.post({
    url  : 'http://localhost:3000/api/orders',
    json : true,
    body : {
      order: order
    }
  }, (data) => {});
  res.send('ok');
});

/* GET home page. */
router.get('/', (req, res, next) => {
  res.render('index', { 
  	title: 'Stripe Gizmo', 
  	order: JSON.stringify(order, null, 2) 
  });
});

module.exports = router;
