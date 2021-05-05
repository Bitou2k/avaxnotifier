const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  _id: String,
  chainID: String,
  type: String,
  inputs: [
    {
      id: String,
      transactionID: String,
      outputIndex: Number,
      assetID: String,
      stake: Boolean,
      frozen: Boolean,
      stakeableout: Boolean,
      genesisutxo: Boolean,
      outputType: Number,
      amount: String,
      locktime: Number,
      stakeLocktime: Number,
      threshold: Number,
      address: String,
      timestamp: String,
      redeemingTransactionID: String,
      chainID: String,
      groupID: Number,
      payload: String,
      block: String,
      nonce: Number,
      rewardUtxo: Boolean
    }
  ],
  outputs: [
    {
      id: String,
      transactionID: String,
      outputIndex: Number,
      assetID: String,
      stake: Boolean,
      frozen: Boolean,
      stakeableout: Boolean,
      genesisutxo: Boolean,
      outputType: Number,
      amount: String,
      locktime: Number,
      stakeLocktime: Number,
      threshold: Number,
      address: String,
      timestamp: String,
      redeemingTransactionID: String,
      chainID: String,
      groupID: Number,
      payload: String,
      block: String,
      nonce: Number,
      rewardUtxo: Boolean
    }
  ],
  memo: String,
  timestamp: String,
  txFee: Number,
  genesis: Boolean,
  rewarded: Boolean,
  rewardedTime: String,
  epoch: Number,
  vertexId: String,
  validatorNodeID: String,
  validatorStart: Number,
  validatorEnd: Number,
  txBlockId: String,
},
{
  _id: false,
  timestamps: true,
});

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction
