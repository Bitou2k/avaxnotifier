const { Markup } = require('telegraf');
const User = require('../../models/user');
const { saveToSession } = require('../../util/session');

/**
 * Displays menu with a list of addresses
 * @param addresses - list of addresses
 */
function getAddressesMenu(addresses) {
  const result = {
    parse_mode: 'HTML',
    ...Markup.inlineKeyboard(
      addresses.map(item => Markup.button.callback(
        `${item.title}`,
        JSON.stringify({ a: 'address', p: item._id }),
        false
      )),
    )
  }
  console.log(result.reply_markup.inline_keyboard, addresses)
  return result
}

/**
 * Menu to control current address
 * @param ctx - telegram context
 */
function getAddressControlMenu(ctx) {
  return {
    parse_mode: 'HTML',
    ...Markup.inlineKeyboard(
      [
        Markup.button.callback(
          ctx.i18n.t('scenes.addresses.back_button'),
          JSON.stringify({ a: 'back', p: undefined }),
          false
        ),
        Markup.button.callback(
          ctx.i18n.t('scenes.addresses.delete_button'),
          JSON.stringify({ a: 'delete', p: ctx.address._id }),
          false
        )
      ]
    )
  };
}

/**
 * Delete address from observable array and refreshes addresses in session
 * @param ctx - telegram context
 */
async function deleteAddressFromObservables(ctx) {
  const user = await User.findOneAndUpdate(
    { _id: ctx.from.id },
    {
      $pull: { observableAddresses: ctx.address._id }
    },
    {
      new: true
    }
  ).populate('observableAddresses');

  saveToSession(ctx, 'addresses', user.observableAddresses);

  return user.observableAddresses;
}

module.exports = {
  getAddressesMenu,
  getAddressControlMenu,
  deleteAddressFromObservables,
}
