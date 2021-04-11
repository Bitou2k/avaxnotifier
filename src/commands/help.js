const { Markup } = require('telegraf')
const utils = require('../utils')

module.exports = async (ctx) => {
  // ctx.reply('One time keyboard',
  //   )
  ctx.replyWithMarkdown(
    utils.getStartMessage(),
    {
      disable_web_page_preview: true,
      ...Markup
        .keyboard(['Addresses', 'Add address'])
        .oneTime()
        .resize()
    }
  )
}
