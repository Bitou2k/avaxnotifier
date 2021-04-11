const { getAddressList } = require('./helpers');
// import logger from '../../util/logger';

/**
 * Exposes required address according to the given callback data
 * @param ctx - telegram context
 * @param next - next function
 */
async function exposeAddress(ctx, next) {
  const addresses = await getAddressList(ctx);
  if (!addresses) {
    // logger.error(ctx, 'Attempt to pick a address from the previous message');
    return await ctx.reply(ctx.i18n.t('shared.something_went_wrong'));
  }

  const action = JSON.parse(ctx.callbackQuery.data);
  ctx.address = addresses.find(item => item.id === action.p);
  return next();
}

module.exports = {
  exposeAddress,
}
