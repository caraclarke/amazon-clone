var express = require('express');
var morgan = require('morgan');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var ejs = require('ejs');
// extension of ejs to create flexible web pages
var engine = require('ejs-mate');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var flash = require('express-flash');

// require user
var User = require('./models/user.js');

var app = express();
var port = 5000;

// connect mongoose to DB
mongoose.connect('mongodb://root:a@ds023613.mlab.com:23613/ecomm', function(err) {
  if (err){
    console.log(err);
  } else {
    console.log('connected to DB');
  }
})

// middleware
// public folder is for static files
app.use(express.static(__dirname + '/public'));
// invoking morgan object
app.use(morgan('dev'));
// parse json data
app.use(bodyParser.json());
// parse url encoded
app.use(bodyParser.urlencoded({ extended: true }));
// cookieParser
app.use(cookieParser());
// session
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: 'cara2@3cA'
}));
// flash
app.use(flash());
// ejs // using ejs-mate engine
app.engine('ejs', engine);
app.set('view engine', 'ejs');

// routes
var mainRoutes = require('./routes/main');
var userRoutes = require('./routes/user');
app.use(mainRoutes);
app.use(userRoutes);

app.listen(port, function(err) {
  if (err) throw err;
  console.log('Server is running on port', port);
});