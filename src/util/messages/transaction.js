const maxTransactionsToShowDefault = 10

const getShortAddress = (address) => address ? `${address.substring(0, 6)}...${address.substring(32)}` : ''

function compareNumbers(a, b) {
  return (b.amount / 1000000000) - (a.amount / 1000000000);
}

const getTransactionMessage = (data, count = maxTransactionsToShowDefault) => `New transaction [${getShortAddress(data.transaction._id)}](https://explorer.avax.network/tx/${data.transaction._id})

Transaction type: ${data.transaction.type}
${data.transaction.inputs && data.transaction.inputs.length ? `
From addresses
${data.transaction.inputs
  .filter(input => !!input.address)
  .slice()
  .sort(compareNumbers)
  .map(input => {
    return `💰 ${(input.amount / 1000000000).toFixed(2)} ${data.assets[input.assetID]} from [${getShortAddress(input.address)}](https://explorer.avax.network/address/${input.address})`
  })
  .join('\n')}
` : ''}
${data.transaction.outputs && data.transaction.outputs.length ? `To addresses
${data.transaction.outputs
  .filter(output => !!output.address)
  .slice()
  .sort(compareNumbers)
  .map(output => {
    return `💰 ${(output.amount / 1000000000).toFixed(2)} ${data.assets[output.assetID]} to [${getShortAddress(output.address)}](https://explorer.avax.network/address/${output.address})`
  })
  .join('\n')}
` : ''}
`
module.exports = getTransactionMessage
