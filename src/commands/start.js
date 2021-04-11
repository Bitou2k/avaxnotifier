const User = require('../models/user')
const utils = require('../utils')

module.exports = async (ctx) => {
  const id = ctx.update.message.from.id

  let user = await User.findOne({ id })

  if (!user) {
    user = new User({
      id: ctx.update.message.from.id,
      username: ctx.update.message.from.username,
      active: true
    })
    await user.save()
  } else if (user && !user.active) {
    user.active = true
    await user.save()
  }

  const data = {}
  ctx.replyWithMarkdown(
    utils.getStartMessage(data),
    {
      disable_web_page_preview: true
    }
  )
}
