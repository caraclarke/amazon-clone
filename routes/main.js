var router = require('express').Router();

// home route
router.get('/', function(req, res) {
  res.render('main/home');
});

// about page route
router.get('/about', function(req, res) {
  res.render('main/about');
});


module.exports = router;