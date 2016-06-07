require('dotenv').config();
module.exports = {
  database: 'mongodb://root:a@ds023613.mlab.com:23613/ecomm',
  port: 5000,
  secretKey: process.env.secretKey
}