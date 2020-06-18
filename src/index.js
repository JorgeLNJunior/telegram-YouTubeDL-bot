const TelegramBot = require('node-telegram-bot-api')
const tydl = require('ytdl-core')
const moment = require('moment')
require('dotenv').config()

const { isYoutubeURL } = require('./utils/link')
const { isCommand } = require('./utils/message')

const token = process.env.TOKEN

const bot = new TelegramBot(token, { polling: true })

// Commands

bot.onText(/\/start/, (msg) => {
  const chatID = msg.chat.id
  bot.sendMessage(
    chatID,
    '*Este bot 🤖 realiza downloads de vídeos 🎬 do youtube ' +
      'com no máximo 30 minutos 🕒 de duração, por favor, envie o link 🔗 ' +
      'do vídeo 🎬 que deseja baixar*',
    { parse_mode: 'Markdown' }
  )
})

bot.onText(/\/info/, (msg) => {
  const chatID = msg.chat.id
  bot.sendMessage(
    chatID,
    '*Este bot 🤖 realiza downloads de vídeos 🎬 do youtube ' +
      'com no máximo 30 minutos 🕒 de duração, por favor, envie o link 🔗 ' +
      'do vídeo 🎬 que deseja baixar*',
    { parse_mode: 'Markdown' }
  )
})

// Messages

bot.on('message', async (msg) => {
  if (isCommand(msg)) {
    return
  }

  const chatID = msg.chat.id

  if (!isYoutubeURL(msg.text)) {
    bot.sendMessage(chatID, 'Por favor, envie um link válido')
  } else {
    try {
      const message = bot.sendMessage(chatID, 'Aguarde um pouco...')

      const data = await tydl.getBasicInfo(msg.text)

      const videoLengthInSeconds = moment
        .utc(moment.duration(data.length_seconds, 'seconds').as('milliseconds'))
        .format('mm:ss')

      bot.deleteMessage(chatID, (await message).message_id)

      bot.sendMessage(
        chatID,
        `📺 *Canal:* ${data.author.name}\n🎬 *Título:* ${data.title}\n🕑 *Duração:* ${videoLengthInSeconds}`,
        { parse_mode: 'Markdown' }
      )
    } catch (error) {
      bot.sendMessage(chatID, error)
    }
  }
})
