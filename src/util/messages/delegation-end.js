const moment = require('moment')
const {
  getShortAddress,
} = require('./common')

const getMessage = (data) => {
  const delegator = data.delegator
  return `Delegation ended

Staked from ${moment.utc(delegator.startTime).format('YYYY-MM-DD')} to ${moment.utc(delegator.endTime).format('YYYY-MM-DD')}

Delegated from ${delegator.rewardOwner}[${getShortAddress(delegator.rewardOwner)}](https://explorer.avax.network/address/${delegator.rewardOwner}) to ${getShortAddress(delegator.nodeID)}

Stake  💰 ${(delegator.stakeAmount / 1000000000).toFixed(2)} AVAX
Reward 💰 ${(delegator.potentialReward / 1000000000).toFixed(2)} AVAX

More info [${getShortAddress(delegator.txID)}](https://explorer.avax.network/tx/${delegator.txID})
`
}

module.exports = getMessage
