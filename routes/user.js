var router = require('express').Router();
var User = require('../models/user.js');

router.get('/signup', function(req, res, next) {
  res.render('accounts/signup', {
    errors: req.flash('errors')
  });
});

router.post('/signup', function(req, res, next) {
  var user = new User();

  user.profile.name = req.body.name;
  user.email = req.body.email;
  user.password = req.body.password;

  // validate user email
  // find only one document in user DB
  User.findOne({ email: req.body.email }, function(err, existingUser) {
    if (existingUser) {
      req.flash('errors', 'Account with that email already exists');
      return res.redirect('/signup');
    } else {
      user.save(function(err, user) {
        if (err) return next(err);

        return res.redirect('/');
      });
    }
  });

});

module.exports = router;