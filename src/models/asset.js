const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema({
  _id: String,
  alias: String,
  chainID: String,
  currentSupply: String,
  denomination: Number,
  name: String,
  nft: Number,
  symbol: String,
  timestamp: String,
  variableCap: Number,
},
{
  _id: false,
  timestamps: true,
});

const Asset = mongoose.model('Asset', assetSchema);

module.exports = Asset
