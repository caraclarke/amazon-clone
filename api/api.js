var router = require('express').Router();
var async = require('async');
var faker = require('faker');
var Category = require('../models/category');
var Product = require('../models/product');

router.get('/:name', function(req, res, next) {

  // run in sequence
  async.waterfall([

    function(callback) {

      // find category from the :name above
      Category.findOne({ name: req.params.name }, function(err, category) {
        if (err) return next(err);
        callback(null, category);
      });
    },

    function(category, callback) {
      for (var i=0; i < 30; i++) {
        var product = new Product();

        product.category = category._id;
        // using faker for name, cost, image
        product.name = faker.commerce.productName();
        product.price = faker.commerce.price();
        product.image = faker.image.image();

        // save product
        product.save();
      }
    }

  ]);

  res.json({ message: 'Success' });
});

module.exports = router;