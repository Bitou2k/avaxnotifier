// import logger from './logger';
const { avax } = require('./search-providers');

// Filter search result so that only fresh address will be visible. Used as currentYear - number
const ADDRESS_TTL = 3;

const addressSearchWrapper = (provider) => async (ctx) => {
  const address = ctx.message.text;
  const userId = String(ctx.from.id);

  const rawResult = await provider({
    address,
    userId,
  });

  // logger.debug(
  //   ctx,
  //   'Address search: params %O, results length %d',
  //   { title, year, language },
  //   filteredResult.length
  // );

  return rawResult;
};

const addressSearch = {
  en: addressSearchWrapper(avax),
  ru: addressSearchWrapper(avax)
};

module.exports = {
  addressSearch,
}
