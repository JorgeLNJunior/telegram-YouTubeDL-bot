const TelegramBot = require('node-telegram-bot-api')
const tydl = require('ytdl-core')
const moment = require('moment')
const { isYoutubeURL } = require('./utils/link')
require('dotenv').config()

const token = process.env.TOKEN
const bot = new TelegramBot(token, { polling: true })

bot.on('message', async (msg) => {
  const chatID = msg.chat.id

  if (!isYoutubeURL(msg.text)) {
    bot.sendMessage(chatID, 'Por favor, envie um link válido')
  } else {
    try {
      bot.sendMessage(chatID, 'Aguarde um pouco...')

      const data = await tydl.getBasicInfo(msg.text)

      const s = moment
        .utc(moment.duration(data.length_seconds, 'seconds').as('milliseconds'))
        .format('mm:ss')

      bot.sendMessage(
        chatID,
        `📺 *Canal:* ${data.author.name}\n🎬 *Título:* ${data.title}\n🕑 *Duração:* ${s}`,
        { parse_mode: 'Markdown' }
      )
    } catch (error) {
      bot.sendMessage(chatID, error)
    }
  }
})
