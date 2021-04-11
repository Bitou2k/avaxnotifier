const { Markup } = require('telegraf');
const Address = require('../../models/address');
const User = require('../../models/user');
const { addressSearch } = require('../../util/address-search');
// import logger from '../../util/logger';
const { saveToSession, deleteFromSession } = require('../../util/session');
// const { releaseChecker } = require('../../util/release-checker');

/**
 * Returning list of addresses. Taken either from API or from the session
 * @param ctx - telegram context
 */
async function getAddressList(ctx) {
  if (ctx.session.addresses) return ctx.session.addresses;

  let addresses;

  try {
    // logger.debug(ctx, 'Searching for address %s', ctx.message.text);
    addresses = await addressSearch[ctx.session.language](ctx);

    saveToSession(ctx, 'addresses', addresses);

    return addresses;
  } catch (e) {
    // logger.error(ctx, 'Search failed with the error: %O', e);
  }
}

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
        JSON.stringify({ a: 'address', p: item.id }),
        false
      )),
    )
  };
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
          ctx.i18n.t('scenes.search.back_button'),
          JSON.stringify({ a: 'back', p: undefined }),
          false
        ),
        Markup.button.callback(
          ctx.i18n.t('scenes.search.add_button'),
          JSON.stringify({ a: 'add', p: ctx.address.id }),
          false
        )
      ],
      {}
    )
  };
}

/**
 * Pushing id to the user's observable array and clearing addresses in session
 * @param ctx - telegram context
 */
async function addAddressForUser(ctx) {
  const address = ctx.address;
  const addressDoc = await Address.findOneAndUpdate(
    {
      _id: address.id
    },
    {
      _id: address.id,
      address: address.address,
      title: address.title,
    },
    {
      new: true,
      upsert: true
    }
  );

  await User.findOneAndUpdate(
    {
      _id: ctx.from.id
    },
    {
      $addToSet: { observableAddresses: addressDoc._id }
    },
    {
      new: true
    }
  );

  deleteFromSession(ctx, 'addresses');
}

/**
 * Perform several checks, returns either a reason why address can't be added or true
 * @param ctx - telegram context
 */
async function canAddAddress(ctx) {
  // logger.debug(ctx, 'Checks if can add a address');
  const addressRelease = false /*await releaseChecker[ctx.session.language]({
    id: ctx.address.id,
    title: ctx.address.title,
    year: ctx.address.year
  });*/

  const user = await User.findById(ctx.from.id);

  if (addressRelease) {
    return ctx.i18n.t('scenes.search.reason_address_released');
  } else if (user.observableAddresses.some(m => m._id === ctx.address.id)) {
    return ctx.i18n.t('scenes.search.reason_already_observing');
  }

  return true;
}

module.exports = {
  getAddressList,
  getAddressesMenu,
  getAddressControlMenu,
  addAddressForUser,
  canAddAddress,
}
