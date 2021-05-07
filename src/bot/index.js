const path = require('path')
const { Telegraf, Scenes, session } = require('telegraf')
// const { session } = require('telegraf-session-mongodb');

const TelegrafI18n = require('telegraf-i18n');
const match = TelegrafI18n.match

// import mongoose from 'mongoose';
// import rp from 'request-promise';
const User = require('../models/user');
// import logger from './util/logger';
const about = require('../controllers/about');
const startScene = require('../controllers/start');
const searchScene = require('../controllers/search');
const addressesScene = require('../controllers/addresses');
const settingsScene = require('../controllers/settings');
// import contactScene from './controllers/contact';
// import adminScene from './controllers/admin';
// import { checkUnreleasedMovies } from './util/notifier';
const asyncWrapper = require('../util/error-handler');
const { getMainKeyboard } = require('../util/keyboards');
const { updateLanguage } = require('../util/language');
const { updateUserTimestamp } = require('../middlewares/update-user-timestamp');
const { getUserInfo } = require('../middlewares/user-info');
// import { isAdmin } from './middlewares/is-admin';
// import Telegram from './telegram';


// const MOVIE_ACTION = 'MOVIE_ACTION'
// const THEATER_ACTION = 'THEATER_ACTION'
// const ADD_ADDRESS = 'ADD_ADDRESS'

// const addressDataWizard = new Scenes.WizardScene(
//   'ADDRESS_DATA_WIZARD_SCENE_ID', // first argument is Scene_ID, same as for BaseScene
//   (ctx) => {
//     ctx.reply('Enter address');
//     ctx.wizard.state.contactData = {};
//     return ctx.wizard.next();
//   },
//   (ctx) => {
//     // validation example
//     if (ctx.message.text.length < 2) {
//       ctx.reply('Please enter address for real');
//       return;
//     }
//     ctx.wizard.state.contactData.fio = ctx.message.text;
//     ctx.reply('Thank you for your replies, we\'ll contact your soon');
//     // await mySendContactDataMomentBeforeErase(ctx.wizard.state.contactData);
//     return ctx.scene.leave();
//   },
// );

// const someOtherScene = new Scenes.BaseScene('SOME_OTHER_SCENE_ID');

// someOtherScene.enter((ctx) => {
//   ctx.session.myData = {};
//   ctx.reply('Hey', Markup.inlineKeyboard([
//     Markup.button.callback('Movie1', MOVIE_ACTION),
//     Markup.button.callback('Theater1', THEATER_ACTION),
//   ]));
// });

// someOtherScene.action(THEATER_ACTION, async (ctx) => {
//   await ctx.answerCbQuery()
//   ctx.reply('You choose theater1');
//   ctx.session.myData.preferenceType = 'Theater';
//   return ctx.scene.enter('ADDRESSES_SCENE_ID'); // switch to some other scene
// });

// someOtherScene.action(MOVIE_ACTION, async (ctx) => {
//   await ctx.answerCbQuery()
//   ctx.reply('You choose movie1, your loss');
//   ctx.session.myData.preferenceType = 'Movie';
//   return ctx.scene.leave(); // exit global namespace
// });


// const addressesScene = new Scenes.BaseScene('ADDRESSES_SCENE_ID');

// const { enter, leave } = Scenes.Stage

// addressesScene.enter((ctx) => {
//   ctx.session.myData = {};
//   ctx.reply('List of addresses', Markup.inlineKeyboard([
//     Markup.button.callback('Add address', ADD_ADDRESS),
//     // Markup.button.callback('', THEATER_ACTION),
//   ]));
// });

// addressesScene.action(ADD_ADDRESS, async (ctx) => {
//   await ctx.answerCbQuery()
//   // ctx.reply('Enter address');
//   ctx.session.myData.preferenceType = 'Theater';
//   return ctx.scene.enter('ADDRESS_DATA_WIZARD_SCENE_ID'); // switch to some other scene
// });


// // scenarioTypeScene.leave((ctx) => {
// //   ctx.reply('Thank you for your time!');
// // });

// addressesScene.command('back', leave())

// // What to do if user entered a raw message or picked some other option?
// // scenarioTypeScene.use((ctx) => ctx.replyWithMarkdown('Please choose either Movie or Theater'));



// const startCommand = require('../commands/start')
// const cycleCommand = require('./commands/cycle')
// const payoutCommand = require('./commands/payout')
// const helpCommand = require('../commands/help')

const bot = new Telegraf(process.env.BOT_TOKEN)

// module.exports = (db) => {
  // const stage = new Scenes.Stage([addressDataWizard]);
  // // bot.use(session()); // to  be precise, session is not a must have for Scenes to work, but it sure is lonely without one

  // bot.use(session(db, { collectionName: 'sessions' }));
  // bot.use(stage.middleware());

  // bot.start(startCommand)
  // bot.command('help', helpCommand)
  // // bot.command('cycle', cycleCommand)
  // // bot.command('payout', payoutCommand)

  // // bot.hears('hi', (ctx) => {
  // //   ctx.scene.enter('ADDRESSES_SCENE_ID')
  // // });

  // bot.command('addresses',  (ctx) => {
  //   ctx.reply('Addresses', Markup.inlineKeyboard([
  //     Markup.button.callback('Add address', 'Add address'),
  //   ]))
  // })
  // bot.action('Addresses',  (ctx) => {
  //   ctx.reply('Addresses', Markup.inlineKeyboard([
  //     Markup.button.callback('Add address', 'Add address'),
  //   ]))
  // })
  // bot.action('Add address', async (ctx) => {
  //   await ctx.answerCbQuery()
  //   return ctx.scene.enter('ADDRESS_DATA_WIZARD_SCENE_ID');
  // })

  // bot.hears('Addresses', (ctx) => {
  //   ctx.reply('Addresses', Markup.inlineKeyboard([
  //     Markup.button.callback('Add address', 'Add address'),
  //   ]))
  // })
  // bot.hears('Add address', async (ctx) => {
  //   // await ctx.answerCbQuery()
  //   return ctx.scene.enter('ADDRESS_DATA_WIZARD_SCENE_ID');
  // })

  // bot.command('onetime', (ctx) =>
  //   ctx.reply('One time keyboard', Markup
  //     .keyboard([
  //       'Addresses',
  //       'Add address',
  //     ])
  //     .oneTime()
  //     .resize()
  //   )
  // )

  const stage = new Scenes.Stage([
    startScene,
    searchScene,
    addressesScene,
    settingsScene,
    // contactScene,
    // adminScene
  ]);
  const i18n = new TelegrafI18n({
    defaultLanguage: 'en',
    directory: path.resolve(__dirname, '..', 'locales'),
    useSession: true,
    allowMissing: false,
    sessionName: 'session'
  });

  bot.use(session());
  // bot.use(session(db, { collectionName: 'sessions' }));
  bot.use(i18n.middleware());
  bot.use(stage.middleware());
  bot.use(getUserInfo);

  bot.command('saveme', async (ctx) => {
    // logger.debug(ctx, 'User uses /saveme command');

    const { mainKeyboard } = getMainKeyboard(ctx);
    await ctx.reply(ctx.i18n.t('shared.what_next'), mainKeyboard);
  });
  bot.start(asyncWrapper(async (ctx) => ctx.scene.enter('start')));
  bot.hears(
    match('keyboards.main_keyboard.search'),
    updateUserTimestamp,
    asyncWrapper(async (ctx) => await ctx.scene.enter('search'))
  );
  bot.hears(
    match('keyboards.main_keyboard.addresses'),
    updateUserTimestamp,
    asyncWrapper(async (ctx) => await ctx.scene.enter('addresses'))
  );
  bot.hears(
    match('keyboards.main_keyboard.settings'),
    updateUserTimestamp,
    asyncWrapper(async (ctx) => await ctx.scene.enter('settings'))
  );
  bot.hears(match('keyboards.main_keyboard.about'), updateUserTimestamp, asyncWrapper(about));
  // bot.hears(
  //   match('keyboards.main_keyboard.contact'),
  //   updateUserTimestamp,
  //   asyncWrapper(async (ctx) => await ctx.scene.enter('contact'))
  // );
  bot.hears(
    match('keyboards.back_keyboard.back'),
    asyncWrapper(async (ctx) => {
      // If this method was triggered, it means that bot was updated when user was not in the main menu..
      // logger.debug(ctx, 'Return to the main menu with the back button');
      const { mainKeyboard } = getMainKeyboard(ctx);

      await ctx.reply(ctx.i18n.t('shared.what_next'), mainKeyboard);
    })
  );

  // bot.hears(
  //   match('keyboards.main_keyboard.support'),
  //   asyncWrapper(async (ctx) => {
  //     logger.debug(ctx, 'Opened support options');

  //     const supportKeyboard = Extra.HTML().markup((m) =>
  //       m.inlineKeyboard(
  //         [
  //           [m.urlButton(`Patreon`, process.env.PATREON_LINK, false)],
  //           [m.urlButton(`Paypal`, process.env.PAYPAL_LINK, false)],
  //           [m.urlButton(`Yandex.Money`, process.env.YANDEX_LINK, false)],
  //           [m.urlButton(`WebMoney`, process.env.WEBMONEY_LINK, false)]
  //         ],
  //         {}
  //       )
  //     );

  //     await ctx.reply(ctx.i18n.t('other.support'), supportKeyboard);
  //   })
  // );

  // bot.hears(
  //   /(.*admin)/,
  //   isAdmin,
  //   asyncWrapper(async (ctx: ContextMessageUpdate) => await ctx.scene.enter('admin'))
  // );

  bot.hears(/(.*?)/, async (ctx) => {
    // logger.debug(ctx, 'Default handler has fired');
    const user = await User.findById(ctx.from.id);
    await updateLanguage(ctx, user.language);

    const { mainKeyboard } = getMainKeyboard(ctx);
    await ctx.reply(ctx.i18n.t('other.default_handler'), mainKeyboard);
  });

  bot.catch((error) => {
    // logger.error(undefined, 'Global error has happened, %O', error);
    console.log(error)
  });

//   return bot
// }

module.exports = bot
