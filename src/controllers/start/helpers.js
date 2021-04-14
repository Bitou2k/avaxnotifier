const { Markup } = require('telegraf');

/**
 * Displays menu with a list of addresses
 * @param addresses - list of addresses
 */
/**
 * Returns language keyboard
 */
function getLanguageKeyboard() {
  return {
    parse_mode: 'HTML',
    ...Markup.inlineKeyboard(
      [
        Markup.button.callback(`English`, JSON.stringify({ a: 'languageChange', p: 'en' }), false),
        // Markup.button.callback(`Русский`, JSON.stringify({ a: 'languageChange', p: 'ru' }), false)
      ],
    )
  };
}

/**
 * Returns button that user has to click to start working with the bot
 */
function getAccountConfirmKeyboard(ctx) {
  return {
    parse_mode: 'HTML',
    ...Markup.inlineKeyboard(
      [
        Markup.button.callback(
          ctx.i18n.t('scenes.start.lets_go'),
          JSON.stringify({ a: 'confirmAccount' }),
          false
        )
      ],
    )
  };
}

module.exports = {
  getLanguageKeyboard,
  getAccountConfirmKeyboard,
}
