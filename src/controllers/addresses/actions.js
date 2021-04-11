const { getAddressControlMenu, getAddressesMenu, deleteAddressFromObservables } = require('./helpers.js');
// import logger from '../../util/logger';

const addressAction = async (ctx) => {
  const text = ctx.i18n.t('scenes.addresses.chosen_address', {
    title: ctx.address.title
  });
  await ctx.editMessageText(
    `${text}<a href="https://explorer.avax.network/address/${ctx.address.address}">.</a>`,
    getAddressControlMenu(ctx)
  );

  await ctx.answerCbQuery();
};

const backAction = async (ctx) => {
  await ctx.editMessageText(
    ctx.i18n.t('scenes.addresses.list_of_addresses'),
    getAddressesMenu(ctx.session.addresses)
  );

  await ctx.answerCbQuery();
};

const deleteAction = async (ctx) => {
  // logger.debug(ctx, 'Removing address %s from collection', ctx.address._id);

  const updatedAddressList = await deleteAddressFromObservables(ctx);
  await ctx.editMessageText(
    ctx.i18n.t('scenes.addresses.list_of_addresses'),
    getAddressesMenu(updatedAddressList)
  );

  await ctx.answerCbQuery();
};

module.exports = {
  addressAction,
  backAction,
  deleteAction,
}
