const {
  getAddressControlMenu,
  canAddAddress,
  addAddressForUser,
  getAddressList,
  getAddressesMenu
} =  require('./helpers');
const { deleteFromSession } = require('../../util/session');
// const logger from '../../util/logger';

const addressAction = async (ctx) => {
  const { title, posterUrl } = ctx.address;
  const text = ctx.i18n.t('scenes.search.chosen_address', {
    title
  });

  await ctx.editMessageText(`${text}\n <a href="${posterUrl}">.</a>`, getAddressControlMenu(ctx));
  await ctx.answerCbQuery();
};

const addAddressAction = async (ctx) => {
  const canAddResult = await canAddAddress(ctx);

  if (typeof canAddResult === 'string') {
    await ctx.editMessageText(ctx.i18n.t('scenes.search.continue_search', { canAddResult }));
  } else {
    // logger.debug(ctx, 'User is adding address %O to this collection', ctx.address);

    await addAddressForUser(ctx);
    await ctx.editMessageText(
      ctx.i18n.t('scenes.search.added_address_to_lib', {
        title: ctx.address.title
      })
    );
  }

  await ctx.answerCbQuery();
  deleteFromSession(ctx, 'addresses');
};

const backAction = async (ctx) => {
  const addresses = await getAddressList(ctx);

  await ctx.editMessageText(
    ctx.i18n.t('scenes.search.list_of_found_addresses'),
    getAddressesMenu(addresses)
  );

  await ctx.answerCbQuery();
};

module.exports = {
  addressAction,
  addAddressAction,
  backAction,
}
