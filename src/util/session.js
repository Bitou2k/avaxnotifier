// import logger from './logger';

/**
 * Saving data to the session
 * @param ctx - telegram context
 * @param field - field to store in
 * @param data - data to store
 */
function saveToSession(ctx, field, data) {
  // logger.debug(ctx, 'Saving %s to session', field);
  ctx.session[field] = data;
}

/**
 * Removing data from the session
 * @param ctx - telegram context
 * @param field - field to delete
 */
function deleteFromSession(ctx, field) {
  // logger.debug(ctx, 'Deleting %s from session', field);
  delete ctx.session[field];
}

module.exports = {
  saveToSession,
  deleteFromSession,
}
