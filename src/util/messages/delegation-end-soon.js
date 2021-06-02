const moment = require('moment')
const {
  getShortAddress,
} = require('./common')

const getMessage = (data) => {
  const delegator = data.delegator
  return `Delegation will end in 24 hours

Staked from ${moment.utc(delegator.startTime, 'X').format('YYYY-MM-DD')} to ${moment.utc(delegator.endTime, 'X').format('YYYY-MM-DD')}

Delegated from [${getShortAddress(delegator.rewardOwner)}](https://explorer.avax.network/address/${delegator.rewardOwner}) to [${getShortAddress(delegator.nodeID)}](https://avaxnodes.com/node/${delegator.nodeID})

Stake  💰 ${(delegator.stakeAmount / 1000000000).toFixed(2)} AVAX
Reward 💰 ${(delegator.potentialReward / 1000000000).toFixed(2)} AVAX

More info [${getShortAddress(delegator.txID)}](https://explorer.avax.network/tx/${delegator.txID})
`
}

module.exports = getMessage
