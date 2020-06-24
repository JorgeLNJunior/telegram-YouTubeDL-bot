const TelegramBot = require('node-telegram-bot-api')
const ytdl = require('ytdl-core')
const moment = require('moment')
const fs = require('fs')
require('dotenv').config()

const { isYoutubeURL } = require('./utils/link')
const { isCommand } = require('./utils/message')

const TOKEN = process.env.TOKEN
const externalURL = 'https://telegram-youtubedl-bot.herokuapp.com/'
const HOST = process.env.HOST || '0.0.0.0'
const PORT = process.env.PORT || 443

const bot = new TelegramBot(TOKEN, {
  webHook: {
    port: PORT,
    host: HOST,
  },
})

bot.setWebHook(externalURL + ':' + PORT + '/bot' + TOKEN)

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
      const waitGif = bot.sendDocument(
        chatID,
        'https://media.giphy.com/media/pFZTlrO0MV6LoWSDXd/giphy.gif'
      )

      const data = await ytdl.getBasicInfo(msg.text)

      if (data.length_seconds >= 1800) {
        bot.deleteMessage(chatID, (await message).message_id)

        bot.sendMessage(
          chatID,
          '*Desculpe, este vídeo não pode ser baixado porque ele ultrapassa os 30 minutos* 😭',
          { parse_mode: 'Markdown' }
        )

        return
      }

      const videoLengthInSeconds = moment
        .utc(moment.duration(data.length_seconds, 'seconds').as('milliseconds'))
        .format('mm:ss')

      const filePath = `downloads/${data.title}.mp4`

      if (!fs.existsSync('downloads')) {
        fs.mkdirSync('downloads')
      }

      ytdl(msg.text, { quality: 136, filter: 'video' })
        .pipe(fs.createWriteStream(filePath))
        .on('finish', async () => {
          await bot.sendVideo(chatID, filePath)

          fs.unlink(filePath, (error) => {
            if (error) {
              console.log(error)
            }
          })

          bot.deleteMessage(chatID, (await message).message_id)
          bot.deleteMessage(chatID, (await waitGif).message_id)

          bot.sendMessage(
            chatID,
            `📺 *Canal:* ${data.author.name}\n🎬 *Título:* ${data.title}\n🕑 *Duração:* ${videoLengthInSeconds}`,
            { parse_mode: 'Markdown' }
          )
        })
        .on('error', async () => {
          bot.deleteMessage(chatID, (await message).message_id)
          bot.deleteMessage(chatID, (await waitGif).message_id)
          bot.sendMessage(chatID, 'Desculpe, ocorreu um erro')
          return
        })
    } catch (error) {
      bot.sendMessage(chatID, 'Desculpe, ocorreu um erro')
      return
    }
  }
})
