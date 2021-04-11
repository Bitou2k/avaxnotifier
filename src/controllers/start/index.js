// import Stage from 'telegraf/stage';
// import Scene from 'telegraf/scenes/base';

const { Scenes } = require('telegraf')

const { languageChangeAction } = require('./actions');
const { getLanguageKeyboard } = require('./helpers');
// import logger from '../../util/logger';
const User = require('../../models/user');
const { getMainKeyboard } = require('../../util/keyboards');

const { leave } = Scenes.Stage;
const start = new Scenes.BaseScene('start');

start.enter(async (ctx) => {
  const uid = String(ctx.from.id);
  const user = await User.findById(uid);
  const { mainKeyboard } = getMainKeyboard(ctx);

  if (user) {
    await ctx.reply(ctx.i18n.t('scenes.start.welcome_back'), mainKeyboard);
  } else {
    // logger.debug(ctx, 'New user has been created');
    const now = new Date().getTime();

    const newUser = new User({
      _id: uid,
      username: ctx.from.username,
      first_name: ctx.from.first_name,
      last_name: ctx.from.last_name,
      observableAddresses: [],
      lastActivity: now,
      totalAddresses: 0,
      language: 'en'
    });

    await newUser.save();
    await ctx.reply('Choose language / Выбери язык', getLanguageKeyboard());
  }
});

start.leave(async (ctx) => {
  const { mainKeyboard } = getMainKeyboard(ctx);

  await ctx.reply(ctx.i18n.t('shared.what_next'), mainKeyboard);
});

start.command('saveme', leave());
start.action(/languageChange/, languageChangeAction);
start.action(/confirmAccount/, async (ctx) => {
  await ctx.answerCbQuery();
  ctx.scene.leave();
});

module.exports = start;
