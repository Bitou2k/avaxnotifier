const { Markup } = require('telegraf');
const { get } = require('lodash');
const { saveToSession } = require('../../util/session');

/**
 * Returns main settings keyboard
 */
function getMainKeyboard(ctx) {
  return {
    parse_mode: 'HTML',
    ...Markup.inlineKeyboard(
      [
        Markup.button.callback(
          ctx.i18n.t('scenes.settings.language_button'),
          JSON.stringify({ a: 'languageSettings' }),
          false
        ),
        Markup.button.callback(
          ctx.i18n.t('scenes.settings.account_summary_button'),
          JSON.stringify({ a: 'accountSummary' }),
          false
        )
      ],
    )
  };
}

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
 * Returns account summary keyboard
 */
function getAccountSummaryKeyboard(ctx) {
  return {
    parse_mode: 'HTML',
    ...Markup.inlineKeyboard(
      [
        Markup.button.callback(
          ctx.i18n.t('scenes.settings.back_button'),
          JSON.stringify({ a: 'closeAccountSummary' }),
          false
        )
      ],
    )
  };
}

/**
 * Send message and saving it to the session. Later it can be deleted.
 * Used to avoid messages duplication
 * @param ctx - telegram context
 * @param translationKey - translation key
 * @param extra - extra for the message, e.g. keyboard
 */
async function sendMessageToBeDeletedLater(
  ctx,
  translationKey,
  extra
) {
  ctx.webhookReply = false;
  const message = await ctx.reply(ctx.i18n.t(translationKey), extra);
  const messagesToDelete = get(ctx.session, 'settingsScene.messagesToDelete', []);

  saveToSession(ctx, 'settingsScene', {
    messagesToDelete: [
      ...messagesToDelete,
      {
        chatId: message.chat.id,
        messageId: message.message_id
      }
    ]
  });
}

module.exports = {
  getMainKeyboard,
  getLanguageKeyboard,
  getAccountSummaryKeyboard,
  sendMessageToBeDeletedLater,
}
