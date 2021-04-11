const { match } = require('telegraf-i18n');
// import Stage from 'telegraf/stage';
// import Scene from 'telegraf/scenes/base';

const { Scenes } = require('telegraf')
const { getAddressesMenu } = require('./helpers.js');
const { exposeAddress } = require('./middlewares');
const { addressAction, backAction, deleteAction } = require('./actions.js');
const User = require('../../models/user');
const { saveToSession, deleteFromSession } = require('../../util/session');
const { getMainKeyboard, getBackKeyboard } = require('../../util/keyboards');
// import logger from '../../util/logger';

const { leave } = Scenes.Stage;
const addresses = new Scenes.BaseScene('addresses');

addresses.enter(async (ctx) => {
  // logger.debug(ctx, 'Enters addresses scene');
  const { backKeyboard } = getBackKeyboard(ctx);
  const user = await User.findById(ctx.from.id);
  const addresses = user.observableAddresses;
  saveToSession(ctx, 'addresses', addresses);

  if (addresses.length) {
    await ctx.reply(ctx.i18n.t('scenes.addresses.list_of_addresses'), getAddressesMenu(addresses));
    await ctx.reply(ctx.i18n.t('scenes.addresses.delete_unwanted_addresses'), backKeyboard);
  } else {
    await ctx.reply(ctx.i18n.t('scenes.addresses.no_addresses_in_collection'), backKeyboard);
  }
});

addresses.leave(async (ctx) => {
  // logger.debug(ctx, 'Leaves addresses scene');
  const { mainKeyboard } = getMainKeyboard(ctx);
  deleteFromSession(ctx, 'addresses');

  await ctx.reply(ctx.i18n.t('shared.what_next'), mainKeyboard);
});

addresses.command('saveme', leave());
addresses.hears(match('keyboards.back_keyboard.back'), leave());

addresses.action(/address/, exposeAddress, addressAction);
addresses.action(/back/, backAction);
addresses.action(/delete/, exposeAddress, deleteAction);

module.exports = addresses;
