require('dotenv').config();
var mongoose = require('mongoose');
var mongoosastic = require('mongoosastic');
var Schema = mongoose.Schema;

var ProductSchema = new Schema({
  category: { type: Schema.Types.ObjectId, ref: 'Category' },
  name: String,
  price: Number,
  image: String
});

ProductSchema.plugin(mongoosastic, {
  hosts: [process.env.BONSAI_URL]
});

module.exports = mongoose.model('Product', ProductSchema);