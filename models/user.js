var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
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

UserSchema.pre('save', function(next) {
  // this refers to user schema
  var user = this;

  if (!user.isModified('password')) return next();
  bcrypt.getSalt(10, function(err, salt) {
    if (err) return next(err);
    bcrypt.hash(user.password, salt, null, function(err, hash) {
      // if theres a hashing error
      if (err) return next(err);

      // if theres no error set password to hash
      user.password = hash;
      // when its done return callback with no parameter
      next();
    });
  });

}); // end UserSchema pre

// compare password in DB to user input password

// create custom method
UserSchema.methods.comparePassword = function(password) {
  return bcrypt.compareSync(password, this.password);
}

// export schema
module.exports = mongoose.model('User', UserSchema);