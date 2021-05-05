const debug = require('debug')('app:jobs:check-transactions')
const axios = require('axios')
const get = require('lodash/get')

const Transaction = require('../models/transaction')
const Address = require('../models/address')
const BotStats = require('../models/bot-stats')

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
    transactions.find(transaction => transaction.id === botStats.latestCheckedTransaction)
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
        addresses: inputAddresses.concat(outputAddresses)
      }
    })
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

  const storedAddressesItems = storedAddresses.map(item => item.address)

  const transactionsToStore = transactionsAddresses
    .filter(transaction => {
      return transaction.addresses.filter(address => storedAddressesItems.includes(address)).length > 0
    })
    .map(transaction => transactionsHash[transaction.id])

  debug({
    transactionsToStore: transactionsToStore.length,
  })

  for (transaction of transactionsToStore) {
    try {
      await Transaction.findOneAndUpdate(
        { _id: transaction.id },
        {
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
        },
        { upsert: true }
      )
    } catch (e) {
      debug(e)
    }
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

  // await agenda.cancel({ nextRunAt: null }, (err, numRemoved) => {
  //   debug(err);
  //   debug('Number of finished jobs removed', numRemoved);
  // });
}

module.exports = {
  handler: agenda => handler(agenda),
  job: agenda => agenda.define('check transactions', handler(agenda))
}
