const TelegramBot = require('node-telegram-bot-api')
const { isYoutubeURL } = require('./utils/link')
require('dotenv').config()

const token = process.env.TOKEN
const bot = new TelegramBot(token, { polling: true })

bot.on('message', (msg) => {
  const chatID = msg.chat.id

  if (!isYoutubeURL(msg.text)) {
    bot.sendMessage(chatID, 'Por favor, envie um link válido')
  } else {
    bot.sendMessage(chatID, 'Ainda não disponível')
  }
})
