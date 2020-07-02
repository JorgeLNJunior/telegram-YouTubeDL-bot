// eslint-disable-next-line no-unused-vars
const TelegramBot = require('node-telegram-bot-api')
const moment = require('moment')

/**
 *
 * @param {URL} url
 * @returns True or False
 *
 */
function isYoutubeURL(url) {
  var regex = /^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/
  if (url.match(regex)) {
    return true
  }
  return false
}

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

function secondsToMinutes(seconds) {
  return moment
    .utc(moment.duration(seconds, 'seconds').as('milliseconds'))
    .format('mm:ss')
}

module.exports = {
  isYoutubeURL,
  isCommand,
  secondsToMinutes,
}
