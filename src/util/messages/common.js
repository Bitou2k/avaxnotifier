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

const getShortAddress = (address) => address ? `${address.substring(0, 6)}...${address.substring(address.length - 4)}` : ''

const prepareAddress = (address, chainID) => `${prepareChainID(chainID)}${address}`
const prepareShortAddress = (address, chainID) => `${prepareChainID(chainID)}${getShortAddress(address)}`

module.exports = {
  prepareChainID,
  getShortAddress,
  prepareAddress,
  prepareShortAddress,
}
