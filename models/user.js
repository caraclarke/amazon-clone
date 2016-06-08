var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var crypto = require('crypto');
var Schema = mongoose.Schema;

// user schema fields

var UserSchema = new Schema({
  email: { type: String, unique: true, lowercase: true },
  password: String,
  facebook: String,
  tokens: Array,
  profile: {
    name: { type: String, default: '' },
    picture: { type: String, default: '' }
  },
  address: String,
  history: [{
    // whenever a user purchases something
    // want to save the products they purchased to this history
    paid: { type: Number, default: 0 },
    item: { type: Schema.Types.ObjectId, ref: 'Product' }
  }]
})

// hash password before saving to database

UserSchema.pre('save', function(next) {
  // this refers to user schema
  var user = this;

  if (!user.isModified('password')) return next();
  bcrypt.genSalt(10, function(err, salt) {
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

// method
UserSchema.methods.gravatar = function(size) {
  if (!this.size) size = 200;
  if (!this.email) return 'https://gravatar.com/avatar/?s' + size + '&d=retro';
  var md5 = crypto.createHash('md5').update(this.email).digest('hex');
  return 'https://gravatar.com/avatar/' + md5 + '?s=' + size + '&d=retro';
}

// export schema
module.exports = mongoose.model('User', UserSchema);