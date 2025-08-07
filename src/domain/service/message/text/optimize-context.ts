import { MessageStatus } from '@prisma/client'
import { IChatSettings } from '@/domain/entity/chat-settings'
import { IMessage } from '@/domain/entity/message'
import { IUser } from '@/domain/entity/user'
import { IModel } from '@/domain/entity/model'
import { MessageStorage } from '../storage/types'
import { ModelService } from '../../model'

type Params = {
  messageStorage: MessageStorage
  modelService: ModelService
}

export type OptimizeContext = (params: {
  user: IUser
  keyEncryptionKey: string | null
  model: IModel
  settings: IChatSettings
  include_context: boolean
  userMessage: IMessage
  chatId: string
}) => Promise<IMessage[]>

export const buildOptimizeContext =
  ({ messageStorage, modelService }: Params): OptimizeContext =>
  async ({ user, keyEncryptionKey, model, settings, include_context, userMessage, chatId }) => {
    let messages: IMessage[] | undefined

    if (include_context) {
      messages = await messageStorage.list({
        user,
        keyEncryptionKey,
        data: {
          where: {
            status: MessageStatus.DONE,
            chat_id: chatId,
            content: {
              not: null,
            },
            disabled: false,
            choiced: true,
          },
          orderBy: {
            created_at: 'asc',
          },
          include: {
            images: {
              include: {
                original: true,
                preview: true,
              },
            },
          },
        },
      })
    } else {
      messages = [userMessage]
    }

    const messagesTokens = await modelService.tokenize({
      model,
      messages,
    })

    const settingsTokens = await modelService.tokenize({
      model,
      settings,
    })

    if (messagesTokens + settingsTokens > model.context_length) {
      const newMessages: IMessage[] = []
      let newTotalTokens = settingsTokens

      for (const message of messages.reverse()) {
        const messageTokens = await modelService.tokenize({
          model,
          messages: [message],
        })

        if (newTotalTokens + messageTokens > model.context_length) {
          break
        }

        newMessages.unshift(message)
        newTotalTokens += messageTokens
      }

      if (newMessages.length === 0) {
        messages = [userMessage]
      } else {
        messages = newMessages
      }
    }

    return messages
  }
