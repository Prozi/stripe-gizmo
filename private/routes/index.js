const fs      = require('fs');
const express = require('express');
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

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { 
  	title: 'Stripe Gizmo', 
  	order: JSON.stringify(order, null, 2) 
  });
});

module.exports = router;
