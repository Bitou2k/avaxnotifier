const debug = require('debug')('app:jobs:check-transactions')
const axios = require('axios')
const get = require('lodash/get')

const Transaction = require('../models/transaction')
const Address = require('../models/address')
const BotStats = require('../models/bot-stats')
const User = require('../models/user')

const MESSAGES_PER_JOB = 30

const getTransactions = async () => {
  const result = await axios.get(`https://explorerapi.avax.network/v2/transactions`, {
    params: {
      sort: 'timestamp-desc',
      limit: 300,
    }
  })

  const transactions = result.data.transactions

  return transactions
}

const prepareTransaction = (transaction) => {
  return {
    _id: transaction.id,
    chainID: transaction.chainID,
    type: transaction.type,
    inputs: transaction.inputs.map(input => {
      const item = input.output
      return {
        id: item.id,
        transactionID: item.transactionID,
        outputIndex: item.outputIndex,
        assetID: item.assetID,
        stake: item.stake,
        frozen: item.frozen,
        stakeableout: item.stakeableout,
        genesisutxo: item.genesisutxo,
        outputType: item.outputType,
        amount: item.amount,
        locktime: item.locktime,
        stakeLocktime: item.stakeLocktime,
        threshold: item.threshold,
        address: get(item, 'addresses[0]'),
        timestamp: item.timestamp,
        redeemingTransactionID: item.redeemingTransactionID,
        chainID: item.chainID,
        groupID: item.groupID,
        payload: item.payload,
        block: item.block,
        nonce: item.nonce,
        rewardUtxo: item.rewardUtxo,
      }
    }),
    outputs: transaction.outputs.map(output => {
      const item = output
      return {
        id: item.id,
        transactionID: item.transactionID,
        outputIndex: item.outputIndex,
        assetID: item.assetID,
        stake: item.stake,
        frozen: item.frozen,
        stakeableout: item.stakeableout,
        genesisutxo: item.genesisutxo,
        outputType: item.outputType,
        amount: item.amount,
        locktime: item.locktime,
        stakeLocktime: item.stakeLocktime,
        threshold: item.threshold,
        address: get(item, 'addresses[0]'),
        timestamp: item.timestamp,
        redeemingTransactionID: item.redeemingTransactionID,
        chainID: item.chainID,
        groupID: item.groupID,
        payload: item.payload,
        block: item.block,
        nonce: item.nonce,
        rewardUtxo: item.rewardUtxo,
      }
    }),
    memo: transaction.memo,
    timestamp: transaction.timestamp,
    txFee: transaction.txFee,
    genesis: transaction.genesis,
    rewarded: transaction.rewarded,
    rewardedTime: transaction.rewardedTime,
    epoch: transaction.epoch,
    vertexId: transaction.vertexId,
    validatorNodeID: transaction.validatorNodeID,
    validatorStart: transaction.validatorStart,
    validatorEnd: transaction.validatorEnd,
    txBlockId: transaction.txBlockId,
  }
}

const handler = agenda => async job => {
  debug()

  const transactions = await getTransactions()

  debug('transactions', transactions.length)

  if (
    transactions &&
    !transactions.length
  ) {
    debug('No transactions found')
    return
  }

  const botStats = await BotStats
    .findOne({ key: 'stats' })
    .lean()
    .exec()

  if (
    transactions &&
    transactions.length &&
    transactions[0] &&
    botStats &&
    transactions[0].id === botStats.latestCheckedTransaction
  ) {
    debug(
      'Latest transaction already checked',
      transactions[0].id,
      botStats.latestCheckedTransaction
    )
    return
  }

  const indexOfStoredTransaction = transactions.indexOf(
    transactions.find(transaction => botStats && transaction.id === botStats.latestCheckedTransaction)
  )

  debug({ indexOfStoredTransaction })

  const transactionsAddresses = transactions
    .filter((transaction, index) => indexOfStoredTransaction >= 0 ? index < indexOfStoredTransaction : true)
    .map(transaction => {
      const inputAddresses = transaction.inputs
        .map(input => {
          return input.output.addresses
        })
        .reduce((result, current) => result.concat(current), [])
      const outputAddresses = transaction.outputs
        .map(output => {
          return output.addresses
        })
        .reduce((result, current) => result.concat(current), [])
      return {
        id: transaction.id,
        addresses: Array.from(new Set(inputAddresses.concat(outputAddresses))),
      }
    })
  const transactionsAddressesHash = transactionsAddresses
    .reduce((result, current) => ({ ...result, [current.id]: current }), {})
  const addresses = transactionsAddresses
    .reduce((result, current) => result.concat(current.addresses), [])
  const uniqueAddreses = Array.from(new Set(addresses))

  const storedAddresses = await Address
    .find({ address: { $in: uniqueAddreses } })
    .lean()
    .exec()

  debug({
    transactions: transactions.length,
    addresses: addresses.length,
    uniqueAddreses: uniqueAddreses.length,
    storedAddresses: storedAddresses.length,
  })

  if (!storedAddresses.length) {
    debug('No transaction for stored address')
  }

  const transactionsHash = transactions
    .reduce((result, current) => ({ ...result, [current.id]: current }), {})

  const storedAddressesIdsItemsHash = storedAddresses
    .map(item => ({ [item._id]: item.address }))
    .reduce((result, current) => ({ ...result, ...current }), {})

  const storedAddressesItemsAddresses = Object.values(storedAddressesIdsItemsHash)

  const transactionsToStore = transactionsAddresses
    .filter(transaction => {
      return transaction.addresses.filter(address => storedAddressesItemsAddresses.includes(address)).length > 0
    })
    .map(transaction => transactionsHash[transaction.id])

  const users = await User
    .find({
      active: true,
      observableAddresses: { $in: Object.keys(storedAddressesIdsItemsHash) }
    })
    .lean()
    .exec();

  debug('users', users.length)
  debug('transactionsToStore', transactionsToStore.length)

  let count = 0
  let messages = []

  for (transaction of transactionsToStore) {

    const receivers = users
      .filter(user => {
        return user.observableAddresses
          .filter(addressItem => {
            return transactionsAddressesHash[transaction.id].addresses
              .includes(storedAddressesIdsItemsHash[addressItem._id])
          }).length > 0
      })
      .map(user => ({
        id: user._id
      }))

    const transactionData = prepareTransaction(transaction)

    for (const receiver of receivers) {
      count++

      const data = {
        id: receiver.id,
        transaction: transactionData
      }
      messages.push(data)

      if (count === MESSAGES_PER_JOB) {
        await agenda.schedule('in 2 seconds', 'send transaction message', { messages });
        messages = []
        count = 0
      }
    }

    try {
      await Transaction.findOneAndUpdate(
        { _id: transaction.id },
        transactionData,
        { upsert: true }
      )
    } catch (e) {
      debug(e)
    }
  }

  if (messages.length) {
    await agenda.schedule('in 2 seconds', 'send transaction message', { messages });
    messages = []
    count = 0
  }

  try {
    await BotStats.findOneAndUpdate(
      { key: 'stats' },
      {
        latestCheckedTransaction: transactions[0].id,
      },
      { upsert: true }
    )
  } catch (e) {
    debug(e)
  }
}

module.exports = {
  handler: agenda => handler(agenda),
  job: agenda => agenda.define('check transactions', handler(agenda))
}
