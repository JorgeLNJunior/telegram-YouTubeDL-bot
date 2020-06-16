const TelegramBot = require('node-telegram-bot-api')
require('dotenv').config()

const token = process.env.TOKEN

const bot = new TelegramBot(token, { polling: true })

bot.on('message', (msg) => {
  const chatID = msg.chat.id
  bot.sendMessage(chatID, `Olá ${msg.from.first_name}!`)
})
