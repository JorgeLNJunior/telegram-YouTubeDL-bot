const TelegramBot = require('node-telegram-bot-api')
const ytdl = require('ytdl-core')
const fs = require('fs')
require('dotenv').config()

const { isYoutubeURL } = require('./utils/link')
const { isCommand } = require('./utils/message')
const { secondsToMinutes } = require('./utils/time')
const ffmpeg = require('fluent-ffmpeg')

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
      const URL = msg.text

      const data = await ytdl.getBasicInfo(URL)

      if (data.length_seconds >= 1800) {
        bot.deleteMessage(chatID, (await message).message_id)

        bot.sendMessage(
          chatID,
          '*Desculpe, este vídeo não pode ser baixado porque ele ultrapassa os 30 minutos* 😭',
          { parse_mode: 'Markdown' }
        )

        return
      }

      const videoLength = secondsToMinutes(data.length_seconds)

      const fileName = `${Date.now()}.mp4`

      if (
        !fs.existsSync('downloads/audio') ||
        !fs.existsSync('downloads/video') ||
        !fs.existsSync('downloads/finished')
      ) {
        fs.mkdirSync('downloads')
        fs.mkdirSync('downloads/audio')
        fs.mkdirSync('downloads/video')
        fs.mkdirSync('downloads/finished')
      }

      ytdl(URL, { quality: 140, filter: 'audio' })
        .pipe(fs.createWriteStream(`downloads/audio/${fileName}`))
        .on('error', async (error) => {
          bot.deleteMessage(chatID, (await message).message_id)
          bot.deleteMessage(chatID, (await waitGif).message_id)
          bot.sendMessage(chatID, 'Desculpe, ocorreu um erro')
          console.log(error)
          return
        })
        .on('finish', async () => {
          ytdl(URL, { quality: 136, filter: 'video' })
            .pipe(fs.createWriteStream(`downloads/video/${fileName}`))
            .on('finish', async () => {
              ffmpeg()
                .input(`downloads/video/${fileName}`)
                .videoCodec('copy')
                .input(`downloads/audio/${fileName}`)
                .audioCodec('copy')
                .save(`downloads/finished/${data.title}.mp4`)
                .on('error', async (error) => {
                  bot.deleteMessage(chatID, (await message).message_id)
                  bot.deleteMessage(chatID, (await waitGif).message_id)
                  bot.sendMessage(chatID, 'Desculpe, ocorreu um erro')
                  console.log(error)
                  return
                })
                .on('end', async () => {
                  bot.deleteMessage(chatID, (await message).message_id)
                  bot.deleteMessage(chatID, (await waitGif).message_id)

                  await bot.sendVideo(
                    chatID,
                    `downloads/finished/${data.title}.mp4`
                  )

                  bot.sendMessage(
                    chatID,
                    `📺 *Canal:* ${data.author.name}\n🎬 *Título:* ${data.title}\n🕑 *Duração:* ${videoLength}`,
                    { parse_mode: 'Markdown' }
                  )

                  fs.unlinkSync(`downloads/video/${fileName}`)
                  fs.unlinkSync(`downloads/audio/${fileName}`)
                  fs.unlinkSync(`downloads/finished/${data.title}.mp4`)
                })
            })
        })
    } catch (error) {
      bot.sendMessage(chatID, 'Desculpe, ocorreu um erro')
      return
    }
  }
})
