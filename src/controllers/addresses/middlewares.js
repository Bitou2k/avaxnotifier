/**
 * Exposes required address according to the given callback data
 * @param ctx - telegram context
 * @param next - next function
 */
function exposeAddress(ctx, next) {
  const action = JSON.parse(ctx.callbackQuery.data);
  ctx.address = (ctx.session.addresses).find((item) => item._id === action.p);

  return next();
}

module.exports = {
  exposeAddress,
}
