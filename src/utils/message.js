// eslint-disable-next-line no-unused-vars
const TelegramBot = require('node-telegram-bot-api')

/**
 *
 * @param {TelegramBot.Message} msg
 * @returns true || false
 */
function isCommand(msg) {
  if (msg.text.startsWith('/', 0)) {
    return true
  } else {
    return false
  }
}

module.exports = {
  isCommand,
}
