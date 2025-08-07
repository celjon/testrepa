import TelegramBot from 'node-telegram-bot-api'
import { TgBotClient, TgBotParseMode } from './types'

type Params = {
  botToken: string
  chatId: string | number
  replyToMessageId?: number
  defaultMessageThreadId?: number
}

export const newClient = ({
  botToken,
  chatId,
  replyToMessageId,
  defaultMessageThreadId,
}: Params): {
  client: TgBotClient
} => {
  const bot = new TelegramBot(botToken, { polling: false })

  const client: TgBotClient = {
    sendMessage: async (
      message,
      parseMode = TgBotParseMode.MARKDOWN,
      messageThreadId: number | undefined = defaultMessageThreadId,
    ) => {
      await bot.sendMessage(chatId, message, {
        ...(parseMode === TgBotParseMode.MARKDOWN && {
          parse_mode: 'MarkdownV2',
        }),
        ...(parseMode === TgBotParseMode.HTML && {
          parse_mode: 'HTML',
        }),
        reply_to_message_id: replyToMessageId,
        message_thread_id: messageThreadId,
      })
    },
  }

  return {
    client,
  }
}

export * from './types'
