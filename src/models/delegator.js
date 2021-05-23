const mongoose = require('mongoose');

const delegatorSchema = new mongoose.Schema({
  nodeID: String,
  txID: String,
  startTime: Number,
  endTime: Number,
  stakeAmount: Number,
  rewardOwner: String,
  potentialReward: Number,
  notificationSent: Boolean,
},
{
  timestamps: true,
});

module.exports = mongoose.models.Delegator || mongoose.model('Delegator', delegatorSchema);
