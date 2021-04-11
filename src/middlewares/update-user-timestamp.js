const User = require('../models/user');

/**
 * Updated last activity timestamp for the user in database
 * @param ctx - telegram context
 * @param next - next function
 */
const updateUserTimestamp = async (ctx, next) => {
  await User.findOneAndUpdate(
    { _id: ctx.from.id },
    { lastActivity: new Date().getTime() },
    { new: true }
  );
  return next();
};

module.exports = {
  updateUserTimestamp,
}
