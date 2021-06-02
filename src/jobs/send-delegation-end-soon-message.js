const bot = require('../bot')
const User = require('../models/user')
const getMessage = require('../util/messages/delegation-end-soon')
const debug = require('debug')('app:jobs:send-delegation-end-soon-message')

const handler = async job => {
  const data = job.attrs.data;

  if (!data || !data.messages) {
    return
  }

  for (const message of data.messages) {
    try {
      await bot.telegram.sendMessage(
        `${message.id}`,
        getMessage(message),
        {
          parse_mode: 'Markdown',
          disable_web_page_preview: true
        }
      )
    } catch (e) {
      debug(e)
      if (e.response && e.response.description && e.response.description === 'Forbidden: bot was blocked by the user') {
        await User.findOneAndUpdate(
          { _id: message.id },
          { active: false }
        );
      }
    }
  }
}

module.exports = {
  handler,
  job: agenda => agenda.define('send delegation end soon message', handler)
}
