const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  _id: String,
  address: String,
  title: String,
},
{
  _id: false,
  timestamps: true,
});

const Address = mongoose.model('Address', addressSchema);

module.exports = Address
