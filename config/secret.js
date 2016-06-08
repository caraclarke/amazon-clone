require('dotenv').config();

module.exports = {
  database: process.env.database,
  port: 5000,
  secretKey: process.env.secretKey,

  facebook: {
    clientID: process.env.FACEBOOK_ID,
    clientSecret: process.env.FACEBOOK_SECRET,
    profieField: ['emails', 'displayName'],
    callbackURL: 'https://caraeb-econn.herokuapp.com/auth/facebook/callback'
  }
}