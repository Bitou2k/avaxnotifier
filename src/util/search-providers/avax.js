// import * as imdbAPI from 'imdb-api';
// import logger from '../logger';
const get = require('lodash/get')
const { setup } = require('axios-cache-adapter')
const shortNodeId = require('../shortNodeId')
const cyrb53 = require('../cyrb53')

const api = setup({
  cache: {
    maxAge: 5 * 60 * 1000,
    key: req => req.url,
    exclude: {
      // Only exclude PUT, PATCH and DELETE methods from cache
      methods: ['put', 'patch', 'delete'],
      query: false,

    },
    debug: false,
  },
})

const searchAddress = async (address) => {
  const result = await api.get(`https://explorerapi.avax.network/x/search?query=${address}&limit=10`, {
    cache: {
      key: "searchAddress"
    }
  })

  const addresses = result.data.results

  return addresses
}

/**
 * Returns list of movies from the imdb API
 * @param params - search parameters
 */
async function avax(params) {
  let result;

  try {
    // result = await imdbAPI.search({ name: params.title, year: params.year }, IMDB_SEARCH_PARAMS);
    result = await searchAddress(params.address)

    console.log(params.address, params.userId, result)

    return result.map(item => {
      const address = get(item, 'data.address')
      return {
        id: cyrb53(`${params.userId}:${address}`),
        address: address,
        title: shortNodeId(address),
        posterUrl: `https://explorer.avax.network/address/${address}`
      }
    });
  } catch (e) {
    console.log(e)
    if (e.message && e.message.includes('Address not found')) {
      // Don't log this 404 message
    } else {
      // logger.error(undefined, 'Error occurred during imdb searching for movie %O. %O', params, e);
    }

    return [];
  }
}

module.exports = {
  avax,
}
