var express = require('express');
var morgan = require('morgan');

var app = express();
var port = 3000;

// invoking morgan object
// middleware
app.use(morgan('dev'));

app.listen(port, function(err) {
  if (err) throw err;
  console.log('Server is running on port', port);
});

// creating request logger