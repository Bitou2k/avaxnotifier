const debug = require('debug')('app:jobs:check-delegation-end')
const moment = require('moment')

const Delegator = require('../models/delegator')
const User = require('../models/user')
const Address = require('../models/address')

const MESSAGES_PER_JOB = 30

const handler = agenda => async job => {
  debug()

  const filter = {
    endTime: {
      $gte: moment().unix() - 600,
      $lte: moment().unix(),
    },
    $or: [
      { notificationSent: { $exists: false }},
      { notificationSent: false }
    ],
  }

  const delegators = await Delegator
    .find(filter)
    .lean()
    .exec()

  debug({ delegators: delegators.length })

  if (!delegators.length) {
    debug('No ended delegators found')
  }

  const delegatorAddresses = delegators.map(item => item.rewardOwner.replace('P-', ''))

  const addressFilter = {
    address: { $in: delegatorAddresses }
  }
  const addresses = await Address
    .find(addressFilter)
    .lean()
    .exec()

  if (!addresses.length) {
    debug('No tracking addresses found')
  }

  const storedAddressesIdsItemsHash = addresses
    .map(item => ({ [item.address]: item._id }))
    .reduce((result, current) => ({ ...result, ...current }), {})

  const userFilter = {
    active: true,
    observableAddresses: { $in: Object.values(storedAddressesIdsItemsHash) }
  }
  const users = await User
    .find(userFilter)
    .lean()
    .exec()

  debug({ users: users.length })
  if (!users.length) {
    debug('No users tracking addresses found')
  }

  let count = 0
  let messages = []

  for (delegator of delegators) {
    const receivers = users
      .filter(user => {
        return user.observableAddresses
          .map(addressItem => addressItem._id)
          .includes(storedAddressesIdsItemsHash[delegator.rewardOwner.replace('P-', '')])
      })
      .map(user => ({
        id: user._id,
      }))

    for (receiver of receivers) {
      count++

      const data = {
        id: receiver.id,
        delegator: delegator,
      }

      messages.push(data)

      if (count === MESSAGES_PER_JOB) {
        await agenda.schedule('in 2 seconds', 'send delegation end message', { messages });
        messages = []
        count = 0
      }
    }
    try {
      await Delegator.findOneAndUpdate(
        { _id: delegator._id },
        {
          notificationSent: true,
        },
        { upsert: false }
      )
    } catch (e) {
      debug(e)
    }
  }
  if (messages.length) {
    await agenda.schedule('in 2 seconds', 'send delegation end message', { messages });
    messages = []
    count = 0
  }
}

module.exports = {
  handler: agenda => handler(agenda),
  job: agenda => agenda.define('check delegation end', handler(agenda))
}
