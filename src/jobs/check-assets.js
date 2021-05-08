const debug = require('debug')('app:jobs:check-assets')
const axios = require('axios')

const Asset = require('../models/asset')

const getAssets = async () => {
  const result = await axios.get(`https://explorerapi.avax.network/v2/cacheassets`)

  const assets = result.data

  return assets
}

const handler = agenda => async job => {
  debug()

  const assets = await getAssets()

  debug({ assets: assets.length })

  for (asset of assets) {
    try {
      await Asset.findOneAndUpdate(
        { _id: asset.id },
        {
          alias: asset.alias,
          chainID: asset.chainID,
          currentSupply: asset.currentSupply,
          denomination: asset.denomination,
          name: asset.name,
          nft: asset.nft,
          symbol: asset.symbol,
          timestamp: asset.timestamp,
          variableCap: asset.variableCap,
        },
        { upsert: true }
      )
    } catch (e) {
      debug(e)
    }
  }
}

module.exports = {
  handler: agenda => handler(agenda),
  job: agenda => agenda.define('check assets', handler(agenda))
}
