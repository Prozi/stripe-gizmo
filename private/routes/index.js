const express = require('express');
const router  = express.Router();

let order = require('../../stripe.order.json');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { 
  	title: 'Stripe Gizmo', 
  	order: JSON.stringify(order, null, 2) 
  });
});

module.exports = router;
