var router = require('express').Router();
var User = require('../models/user');
var Product = require('../models/product');
var Cart = require('../models/cart');
var async = require('async');
require('dotenv').config();

var stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

function paginate(req, res, next) {

  var perPage = 9;
  var page = req.params.page;

  Product
    .find()
    // skip and limit paginate products
    .skip(perPage * page)
    .limit(perPage)
    .populate('category')
    .exec(function(err, products) {
      if (err) return next(err);

      Product.count().exec(function(err, count) {
        if (err) return next(err);

        res.render('main/product-main', {
          products: products,
          pages: count / perPage
        });
      });
    });

}

// map between product database and elasticsearch
Product.createMapping(function(err, mapping) {
  if (err) {
    console.log('error creating mapping', err);
  } else {
    console.log('mapping created', mapping);
  }
});

// synchronize product in elasticsearch replica set
var stream = Product.synchronize();
var count = 0;

// run three different sets of methods
// count documents
stream.on('data', function() {
  count++;
});

// once close synchronize it will count all the documents
stream.on('close', function() {
  console.log('Indexed ' + count + ' documents');
});

// show error if error
stream.on('error', function(err) {
  console.log(err);
});

// cart routes
router.get('/cart', function(req, res, next) {
  Cart
    .findOne({ owner: req.user._id })
    .populate('items.item')
    .exec(function(err, foundCart) {
      if (err) return next(err);

      res.render('main/cart', {
        foundCart: foundCart,
        message: req.flash('remove')
      });
    });
});

router.post('/product/:product_id', function(req, res, next) {
  Cart.findOne({ owner: req.user._id }, function(err, cart) {
    cart.items.push({
      item: req.body.product_id,
      price: parseFloat(req.body.priceValue),
      quantity: parseInt(req.body.quantity)
    });

    // total price
    cart.total = (cart.total + parseFloat(req.body.priceValue)).toFixed(2);

    cart.save(function(err) {
      if (err) return next(err);

      return res.redirect('/cart');
    });
  });

});

router.post('/remove', function(req, res, next) {
  Cart.findOne({ owner: req.user._id }, function(err, foundCart) {
    foundCart.items.pull(String(req.body.item));

    foundCart.total = (foundCart.total - parseFloat(req.body.price)).toFixed(2);
    foundCart.save(function(err, found) {
      if (err) return next(err);

      req.flash('remove', 'Successfully removed');
      res.redirect('/cart');
    });
  });
});

// search routes
router.post('/search', function(req, res, next) {
  res.redirect('/search?q=' + req.body.q);
});

router.get('/search', function(req, res, next) {
  if (req.query.q) {
    // search value we receive from post
    // search elasticsearch replica set
    Product.search({
      query_string: { query: req.query.q }
    }, function(err, results) {
      // if err give error
      if (err) return next(err);

      // otherwise return results
      var data = results.hits.hits.map(function(hit) {
        return hit;
      });

      // render data
      res.render('main/search-result', {
        query: req.query.q,
        data: data
      });
    });
  }
});

// home route
router.get('/', function(req, res, next) {
  if (req.user) {
    paginate(req, res, next);
  } else {
    // if user isn't logged in
    res.render('main/home');
  }
});

// switch between paginated pages on homepage
router.get('/page/:page', function(req, res, next) {
  paginate(req,res,next);
});

// view all products
router.get('/products/:id', function(req, res, next) {
  Product
    .find({ category: req.params.id })
    .populate('category')
    .exec(function(err, products) {
      if (err) return next(err);

      res.render('main/category', { products: products });
    })
});

// view specific product
router.get('/product/:id', function(req, res, next) {
  Product.findById({ _id: req.params.id }, function(err, product) {
    if (err) return next(err);

    res.render('main/product', {
      product: product
    });
  });
});

// stripe
router.post('/payment', function(req, res, next) {
  var stripeToken = req.body.stripeToken;
  var currentCharges = Math.round(req.body.stripeMoney * 100);

  stripe.customers.create({
    source: stripeToken
  }).then(function(customer) {
    return stripe.charges.create({
      amount: currentCharges,
      currency: 'usd',
      customer: customer.id
    });
  }, function(err, charge) {
    if (err && err.type === 'StripeCardError') {
      console.log('card has been declined', err);
    } else {
      console.log('payment successful');
    }
  }).then(function(charge) {
    async.waterfall([
      function(callback) {
        Cart.findOne({ owner: req.user._id }, function(err, cart) {
          callback(err, cart);
        });
      },

      function(cart, callback) {
        User.findOne({ _id: req.user._id }, function(err, user) {
          if (user) {
            for (var i=0; i < cart.items.length; i++) {
              user.history.push({
                item: cart.items[i].item,
                paid: cart.items[i].price
              });
            }

            user.save(function(err, user) {
              if (err) return next(err);

              callback(err, user);
            });
          }
        });
      },

      function(user, callback) {
        Cart.update({ owner: user._id }, { $set: { items: [], total: 0 }}, function(err, updated) {
          if (updated) {
            res.redirect('/profile');
          }
        });
      }
    ]);
  });

});

module.exports = router;