const { match } = require('telegraf-i18n');
// import logger from '../../util/logger';
const { Scenes } = require('telegraf')
const { deleteFromSession } = require('../../util/session');
const { getAddressesMenu, getAddressList } = require('./helpers');
const { getMainKeyboard, getBackKeyboard } = require('../../util/keyboards');
const { addressAction, addAddressAction, backAction } = require('./actions');
const { exposeAddress } = require('./middlewares');

const { leave } = Scenes.Stage;
const searcher = new Scenes.BaseScene('search');

searcher.enter(async (ctx) => {
  // logger.debug(ctx, 'Enter search scene');
  const { backKeyboard } = getBackKeyboard(ctx);
  await ctx.reply(ctx.i18n.t('scenes.search.welcome_to_search'), backKeyboard);
});
searcher.leave(async (ctx) => {
  // logger.debug(ctx, 'Leaves search scene');
  const { mainKeyboard } = getMainKeyboard(ctx);
  deleteFromSession(ctx, 'addresses');

  await ctx.reply(ctx.i18n.t('shared.what_next'), mainKeyboard);
});

searcher.command('saveme', leave());
searcher.hears(match('keyboards.back_keyboard.back'), leave());

searcher.on('text', async (ctx) => {
  deleteFromSession(ctx, 'addresses');
  const addresses = await getAddressList(ctx);

  if (!addresses || !addresses.length) {
    await ctx.reply(ctx.i18n.t('scenes.search.no_addresses_found'));
    return;
  }

  await ctx.reply(ctx.i18n.t('scenes.search.list_of_found_addresses'), getAddressesMenu(addresses));
});

searcher.action(/address/, exposeAddress, addressAction);
searcher.action(/add/, exposeAddress, addAddressAction);
searcher.action(/back/, backAction);

module.exports = searcher;
