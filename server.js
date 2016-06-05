var express = require('express');
var morgan = require('morgan');
var mongoose = require('mongoose');

var app = express();
var port = 3000;

// connect mongoose to DB
mongoose.connect('mongodb://root:a@ds023613.mlab.com:23613/ecomm', function(err) {
  if (err){
    console.log(err);
  } else {
    console.log('connected to DB');
  }
})

// invoking morgan object
// middleware
app.use(morgan('dev'));

app.get('/', function(req, res) {
  res.json('face face');
});

app.listen(port, function(err) {
  if (err) throw err;
  console.log('Server is running on port', port);
});