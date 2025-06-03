import { UseCaseParams } from '@/domain/usecase/types'
import { ActionType } from '@prisma/client'
import { IMessage } from '@/domain/entity/message'
import { NotFoundError } from '@/domain/errors'

export type ClearContext = (params: { userId: string; keyEncryptionKey: string | null; chatId: string }) => Promise<IMessage | never>

export const buildClearContext = ({ adapter, service }: UseCaseParams): ClearContext => {
  return async ({ userId, keyEncryptionKey, chatId }) => {
    let chat = await adapter.chatRepository.get({
      where: {
        id: chatId,
        user_id: userId,
        deleted: false
      }
    })

    if (!chat) {
      throw new NotFoundError({
        code: 'CHAT_NOT_FOUND'
      })
    }

    const user = await adapter.userRepository.get({
      where: {
        id: userId
      }
    })

    if (!user) {
      throw new NotFoundError({
        code: 'USER_NOT_FOUND'
      })
    }

    const clearContextJob = await service.job.create({
      name: 'CLEAR_CONTEXT',
      chat
    })

    await clearContextJob.start()

    const [, message] = await Promise.all([
      service.message.storage.updateMany({
        user,
        keyEncryptionKey,
        data: {
          where: {
            chat_id: chat.id
          },
          data: {
            disabled: true
          }
        }
      }),
      service.message.storage.create({
        user,
        keyEncryptionKey,
        data: {
          data: {
            role: 'action',
            chat_id: chat.id,
            user_id: userId,
            action_type: ActionType.CONTEXT_CLEARED,
            job_id: clearContextJob.id
          },
          include: {
            job: true
          }
        }
      })
    ])

    service.chat.eventStream.emit({
      chat,
      event: {
        name: 'MESSAGE_CREATE',
        data: {
          message
        }
      }
    })

    chat =
      (await adapter.chatRepository.update({
        where: {
          id: chat.id
        },
        data: {
          total_caps: 0
        }
      })) ?? chat

    service.chat.eventStream.emit({
      chat,
      event: {
        name: 'UPDATE',
        data: {
          chat: {
            total_caps: chat.total_caps
          }
        }
      }
    })

    await clearContextJob.done()

    return message
  }
}
