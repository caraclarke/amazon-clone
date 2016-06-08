var passport = require('passport');
var LocalStrategy = require('passport-local');
var FacebookStrategy = require('passport-facebook').Strategy;
var secret = require('./secret');
var User = require('../models/user');

var async = require('async');
var Cart = require('../models/cart');

// serialize and deserialize
passport.serializeUser(function(user, done) {
  // _id created in mongodb
  done(null, user._id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

// middleware

// giving name of local-login to refer to it later
// new instance of LocalStrategy & pass it request fields
passport.use('local-login', new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback: true
}, function(req, email, password, done) {
  // find specific email you just entered
  User.findOne({ email: email }, function(err, user) {
    if (err) return done(err);

    if (!user) {
      return done(null, false, req.flash('loginMessage', 'No user has been found'));
    } else if (!user.comparePassword(password)) {
      return done(null, false, req.flash('loginMessage', 'Incorrect password'));
    } else {
      // found user
      return done(null, user);
    }

  });
}));

// facebook
passport.use(new FacebookStrategy(secret.facebook, function(token, refreshToken, profile, done) {
  User.findOne({ facebook: profile.id }, function(err, user) {
    if (err) return done(err);

    if (user) {
      // user exists
      // pass user object
      return done(null, user);
    } else {
      async.waterfall([
        function(callback) {
          var newUser = new User();
          newUser.email = profile._json.email;
          newUser.facebook = profile.id;
          newUser.tokens.push({ kind: 'facebook', token: token });
          newUser.profile.name = profile.displayName;
          newUser.profile.picture = 'https://graph.facebook.com/' + profile.id + '/picture?type=large';

          newUser.save(function(err) {
            if (err) return done(err);

            callback(err, newUser);
          });
        },

        function(newUser) {
          var cart = new Cart();

          cart.owner = newUser._id;
          cart.save(function(err) {
            if (err) return done(err);

            return done(err, newUser);
          });
        }
      ])
    }
  });
}));

// validate
exports.isAuthenticated = function(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.redirect('/login');
  }
}