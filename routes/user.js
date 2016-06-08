var router = require('express').Router();
var User = require('../models/user.js');
var Cart = require('../models/cart.js');
var async = require('async');
var passport = require('passport');
var passportConfig = require('../config/passport');

router.get('/login', function(req, res) {
  if (req.user) return res.redirect('/');

  res.render('accounts/login', { message: req.flash('loginMessage') });
});

router.post('/login', passport.authenticate('local-login', {
  successRedirect: '/profile',
  failureRedirect: '/login',
  failureFlash: true
}));

router.get('/profile', passportConfig.isAuthenticated, function(req, res, next) {
  User
    .findOne({ _id: req.user._id })
    .populate('history.item')
    .exec(function(err, foundUser) {
      if (err) return next(err);

      res.render('accounts/profile', { user: foundUser })
    });

});

router.get('/signup', function(req, res, next) {
  res.render('accounts/signup', {
    errors: req.flash('errors')
  });
});

router.post('/signup', function(req, res, next) {

  async.waterfall([
    function(callback) {
      var user = new User();

      user.profile.name = req.body.name;
      user.email = req.body.email;
      user.password = req.body.password;
      user.profile.picture = user.gravatar();

      // validate user email
      // find only one document in user DB
      User.findOne({ email: req.body.email }, function(err, existingUser) {
        if (existingUser) {
          req.flash('errors', 'Account with that email already exists');
          return res.redirect('/signup');
        } else {
          user.save(function(err, user) {
            if (err) return next(err);

            callback(null, user);
          });
        }
      });
    },

    function(user) {
      var cart = new Cart();
      cart.owner = user._id;
      cart.save(function(err) {
        if (err) return next(err);

        // add session to server and cookie to browser using logIn
        // user object is result of new user creation
        req.logIn(user, function(err) {
          if (err) return next(err);

          res.redirect('/profile');
        });
      });
    }

  ]);
});

router.get('/logout', function(req, res, next) {
  req.logout();
  res.redirect('/');
});

router.get('/edit-profile', function(req, res, next) {
  res.render('accounts/edit-profile', { message: req.flash('success') });
});

router.post('/edit-profile', function(req, res, next) {

  // find user using currently logged in user id
  User.findOne({ _id: req.user._id }, function(err, user) {
    if (err) return next(err);

    // replace users existing data with data newly input
    if (req.body.name) user.profile.name = req.body.name;
    if (req.body.address) user.address = req.body.address;

    // save users data and flash message
    user.save(function(err) {
      if (err) return next(err);

      req.flash('success', 'Successfully edited profile');
      return res.redirect('/profile');
    });
  });

});

// facebook
router.get('/auth/facebook', passport.authenticate('facebook', { scope: 'email' }));

// handle post-authentication callback
router.get('/auth/facebook/callback', passport.authenticate('facebook', {
  successRedirect: '/profile',
  failureRedirect: '/login'
}));

module.exports = router;