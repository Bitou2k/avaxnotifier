const maxTransactionsToShowDefault = 10

const getShortAddress = (address) => address ? `${address.substring(0, 6)}...${address.substring(32)}` : ''

const getTransactionMessage = (data, count = maxTransactionsToShowDefault) => `New transaction [${getShortAddress(data.transaction._id)}](https://explorer.avax.network/tx/${data.transaction._id})

Transaction type: ${data.transaction.type}

From addresses

${data.transaction.inputs
  .filter(input => !!input.address)
  .map(input => {
    return `💰 ${(input.amount / 1000000000).toFixed(2)} ꜩ to [${getShortAddress(input.address)}](https://explorer.avax.network/address/${input.address})`
  })
  .join('\n')}\n
To addresses

${data.transaction.outputs
  .filter(output => !!output.address)
  .map(output => {
    return `💰 ${(output.amount / 1000000000).toFixed(2)} ꜩ to [${getShortAddress(output.address)}](https://explorer.avax.network/address/${output.address})`
  })
  .join('\n')}

`
module.exports = getTransactionMessage
