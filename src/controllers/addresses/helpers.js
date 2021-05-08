const { Markup } = require('telegraf');
const User = require('../../models/user');
const { saveToSession } = require('../../util/session');

function chunkify(a, n, balanced) {

  if (n < 2)
      return [a];

  var len = a.length,
          out = [],
          i = 0,
          size;

  if (len % n === 0) {
      size = Math.floor(len / n);
      while (i < len) {
          out.push(a.slice(i, i += size));
      }
  }

  else if (balanced) {
      while (i < len) {
          size = Math.ceil((len - i) / n--);
          out.push(a.slice(i, i += size));
      }
  }

  else {

      n--;
      size = Math.floor(len / n);
      if (len % size === 0)
          size--;
      while (i < size * n) {
          out.push(a.slice(i, i += size));
      }
      out.push(a.slice(size * n));

  }

  return out;
}

/**
 * Displays menu with a list of addresses
 * @param addresses - list of addresses
 */
function getAddressesMenu(addresses) {
  const result = {
    parse_mode: 'HTML',
    ...Markup.inlineKeyboard(
      chunkify(
        addresses.map(item => Markup.button.callback(
          `${item.title}`,
          JSON.stringify({ a: 'address', p: item._id }),
          false
        )),
        Math.ceil(addresses.length / 3)
      )
    )
  }
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
