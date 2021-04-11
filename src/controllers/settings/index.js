const { match } = require('telegraf-i18n');
// import Stage from 'telegraf/stage';
// import Scene from 'telegraf/scenes/base';

const { Scenes } = require('telegraf')

const helpers = require('./helpers');
const sendMessageToBeDeletedLater = helpers.sendMessageToBeDeletedLater
const getSettingsMainKeyboard = helpers.getMainKeyboard
const {
  languageSettingsAction,
  languageChangeAction,
  accountSummaryAction,
  closeAccountSummaryAction
} = require('./actions');
const { getMainKeyboard, getBackKeyboard } = require('../../util/keyboards');
const { deleteFromSession } = require('../../util/session');
// import logger from '../../util/logger';

const { leave } = Scenes.Stage;
const settings = new Scenes.BaseScene('settings');

settings.enter(async (ctx) => {
  // logger.debug(ctx, 'Enters settings scene');
  const { backKeyboard } = getBackKeyboard(ctx);

  deleteFromSession(ctx, 'settingsScene');
  await sendMessageToBeDeletedLater(
    ctx,
    'scenes.settings.what_to_change',
    getSettingsMainKeyboard(ctx)
  );
  await sendMessageToBeDeletedLater(ctx, 'scenes.settings.settings', backKeyboard);
});

settings.leave(async (ctx) => {
  // logger.debug(ctx, 'Leaves settings scene');
  const { mainKeyboard } = getMainKeyboard(ctx);
  await ctx.reply(ctx.i18n.t('shared.what_next'), mainKeyboard);
  deleteFromSession(ctx, 'settingsScene');
});

settings.command('saveme', leave());
settings.hears(match('keyboards.back_keyboard.back'), leave());

settings.action(/languageSettings/, languageSettingsAction);
settings.action(/languageChange/, languageChangeAction);
settings.action(/accountSummary/, accountSummaryAction);
settings.action(/closeAccountSummary/, closeAccountSummaryAction);

module.exports = settings;
