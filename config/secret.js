require('dotenv').config();

module.exports = {
  database: process.env.database,
  port: 5000,
  secretKey: process.env.secretKey,

  facebook: {
    clientId: process.env.FACEBOOK_ID,
    clientSecret: process.env.FACEBOOK_SECRET,
    profieField: ['emails', 'displayName'],
    callbackURL: 'http://localhost:5000/auth/facebook/callback'
  }
}