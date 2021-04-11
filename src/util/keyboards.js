const { Markup } = require('telegraf');

/**
 * Returns back keyboard and its buttons according to the language
 * @param ctx - telegram context
 */
const getBackKeyboard = (ctx) => {
  const backKeyboardBack = ctx.i18n.t('keyboards.back_keyboard.back');
  let backKeyboard = Markup.keyboard([backKeyboardBack]);

  backKeyboard = backKeyboard.resize();

  return {
    backKeyboard,
    backKeyboardBack
  };
};

/**
 * Returns main keyboard and its buttons according to the language
 * @param ctx - telegram context
 */
const getMainKeyboard = (ctx) => {
  const mainKeyboardSearchAddresses = ctx.i18n.t('keyboards.main_keyboard.search');
  const mainKeyboardMyCollection = ctx.i18n.t('keyboards.main_keyboard.addresses');
  const mainKeyboardSettings = ctx.i18n.t('keyboards.main_keyboard.settings');
  const mainKeyboardAbout = ctx.i18n.t('keyboards.main_keyboard.about');
  // const mainKeyboardSupport = ctx.i18n.t('keyboards.main_keyboard.support');
  // const mainKeyboardContact = ctx.i18n.t('keyboards.main_keyboard.contact');
  let mainKeyboard = Markup.keyboard([
    [mainKeyboardSearchAddresses, mainKeyboardMyCollection],
    [mainKeyboardSettings, mainKeyboardAbout],
    // [mainKeyboardSupport, mainKeyboardContact]
  ]);
  mainKeyboard = mainKeyboard.resize();

  return {
    mainKeyboard,
    mainKeyboardSearchAddresses,
    mainKeyboardMyCollection,
    mainKeyboardSettings,
    mainKeyboardAbout,
    // mainKeyboardSupport,
    // mainKeyboardContact
  };
};

module.exports = {
  getBackKeyboard,
  getMainKeyboard,
}
