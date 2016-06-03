var express = require('express');

var app = express();
var port = 3000;

app.listen(port, function(err) {
  if (err) throw err;
  console.log('Server is running on port', port);
});