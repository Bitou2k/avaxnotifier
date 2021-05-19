const maxTransactionsToShowDefault = 10

const getShortAddress = (address) => address ? `${address.substring(0, 6)}...${address.substring(address.length - 4)}` : ''

const prepareChainID = (chainID) => {
  if (chainID === '11111111111111111111111111111111LpoYY') {
    return 'P-'
  }
  if (chainID === '2oYMBNV4eNHyqk2fjjV5nVQLDbtmNJzq5s3qs3Lo6ftnC6FByM') {
    return 'X-'
  }
  if (chainID === '2q9e4r6Mu3U68nU1fYjgbR6JvwrRx36CohpAX5UQxse55x1Q5') {
    return 'C-'
  }
  return ''
}

const prepareAddress = (address, chainID) => `${prepareChainID(chainID)}${address}`
const prepareShortAddress = (address, chainID) => `${prepareChainID(chainID)}${getShortAddress(address)}`

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
    return `${data.addresses.includes(input.address) ? '*' : ''}💰 ${(input.amount / 1000000000).toFixed(2)} ${data.assets[input.assetID]}${data.addresses.includes(input.address) ? '*' : ''} from [${prepareShortAddress(input.address, input.chainID)}](https://explorer.avax.network/address/${prepareAddress(input.address, input.chainID)})`
  })
  .join('\n')}
` : ''}
${data.transaction.outputs && data.transaction.outputs.length ? `To addresses
${data.transaction.outputs
  .filter(output => !!output.address)
  .slice()
  .sort(compareNumbers)
  .map(output => {
    return `${data.addresses.includes(output.address) ? '*' : ''}💰 ${(output.amount / 1000000000).toFixed(2)} ${data.assets[output.assetID]}${data.addresses.includes(output.address) ? '*' : ''} to [${prepareShortAddress(output.address, output.chainID)}](https://explorer.avax.network/address/${prepareAddress(output.address, output.chainID)})`
  })
  .join('\n')}
` : ''}
`
module.exports = getTransactionMessage
