const mongoose = require('mongoose');

const botStatsSchema = new mongoose.Schema({
  key: String,
  latestCheckedTransaction: String,
},
{
  timestamps: true,
});

const BotStats = mongoose.model('BotStats', botStatsSchema);

module.exports = BotStats
