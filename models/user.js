var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var Schema = mongoose.Schema;

// user schema fields

var UserSchema = new Schema({
  email: { type: String, unique: true, lowercase: true },
  password: String,
  profile: {
    name: { type: String, default: '' },
    picture: { type: String, default: '' }
  },
  address: String,
  history: [{
    // whenever a user purchases something
    // want to save the products they purchased to this history
    date: Date,
    paid: { type: Number, default: 0 }
  }]
})

// hash password before saving to database

// compare password in DB to user input password