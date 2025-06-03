import { ForbiddenError, NotFoundError } from '@/domain/errors'
import { UseCaseParams } from '../types'
import { isImageModel, isMidjourney, isReplicateImageModel, isSpeechModel, isTextModel } from '@/domain/entity/model'
import { IMessage } from '@/domain/entity/message'
import { Platform } from '@prisma/client'
import { determinePlatform } from '@/domain/entity/action'

export type Regenerate = (params: {
  userId: string
  keyEncryptionKey: string | null
  messageId: string
  userMessageId?: string
  platform?: Platform
  locale: string
}) => Promise<IMessage>

export const buildRegenerate =
  ({ adapter, service }: UseCaseParams): Regenerate =>
  async ({ userId, keyEncryptionKey, messageId, userMessageId, platform, locale }) => {
    const user = await adapter.userRepository.get({
      where: { id: userId }
    })

    if (!user) {
      throw new NotFoundError({
        code: 'USER_NOT_FOUND',
        message: 'User not found'
      })
    }

    const oldMessage = await service.message.storage.get({
      user,
      keyEncryptionKey,
      data: {
        where: {
          id: messageId,
          user_id: userId
        },
        include: {
          set: true,
          chat: {
            include: {
              model: true
            }
          }
        }
      }
    })

    if (!oldMessage || !oldMessage.chat) {
      throw new NotFoundError({
        code: 'MESSAGE_NOT_FOUND',
        message: 'Message for regenerate not found'
      })
    }

    let { chat } = oldMessage

    chat =
      (await adapter.chatRepository.get({
        where: {
          id: oldMessage.chat_id,
          user_id: userId,
          deleted: false
        },
        include: {
          model: true,
          model_function: true,
          ...(chat.model && {
            settings: {
              include: {
                text: isTextModel(chat.model),
                image: isImageModel(chat.model),
                mj: isMidjourney(chat.model),
                replicateImage: isReplicateImageModel(chat.model),
                speech: isSpeechModel(chat.model)
              }
            }
          }),
          ...(!chat.model && {
            settings: true
          })
        }
      })) ?? oldMessage.chat

    if (!chat.model || !chat.settings) {
      throw new NotFoundError({
        code: 'CHAT_NOT_FOUND',
        message: 'Chat not found'
      })
    }

    const subscription = await service.user.getActualSubscriptionById(user.id)

    if (!subscription || (subscription && subscription.balance <= 0) || !subscription.plan) {
      throw new ForbiddenError({
        code: 'NOT_ENOUGH_TOKENS'
      })
    }

    const employee = await adapter.employeeRepository.get({
      where: {
        user_id: userId
      },
      include: {
        allowed_models: true
      }
    })
    const employeeId = employee?.allowed_models?.length != 0 ? employee?.id : undefined

    const determinedPlatform = determinePlatform(platform, !!employee?.enterprise_id)

    let { hasAccess, reasonCode } = await service.plan.hasAccess(subscription.plan, chat.model.id, employeeId)

    const parentModelId = chat.model.id
    let childModelId = null

    // check access for child models
    if (isTextModel(chat.model) && chat.settings.text) {
      const access = await service.plan.hasAccess(subscription.plan, chat.settings.text.model, employeeId)
      hasAccess = access.hasAccess
      reasonCode = access.reasonCode

      childModelId = chat.settings.text.model
    } else if (isReplicateImageModel(chat.model) && chat.settings.replicateImage) {
      const access = await service.plan.hasAccess(subscription.plan, chat.settings.replicateImage.model, employeeId)
      hasAccess = access.hasAccess
      reasonCode = access.reasonCode

      childModelId = chat.settings.replicateImage.model
    } else if (isImageModel(chat.model) && chat.settings.image) {
      const access = await service.plan.hasAccess(subscription.plan, chat.settings.image.model, employeeId)
      hasAccess = access.hasAccess
      reasonCode = access.reasonCode

      childModelId = chat.settings.image.model
    }

    await service.model.incrementUsage({
      modelIds: [parentModelId, ...(childModelId ? [childModelId] : [])]
    })

    if (!hasAccess) {
      throw new ForbiddenError({
        code: reasonCode ?? 'MODEL_NOT_ALLOWED_FOR_PLAN'
      })
    }

    const userMessage = userMessageId
      ? await service.message.storage.get({
          user,
          keyEncryptionKey,
          data: {
            where: {
              id: userMessageId,
              user_id: userId,
              role: 'user'
            }
          }
        })
      : undefined

    let message: IMessage

    if (isTextModel(chat.model)) {
      message = await service.message.text.regenerate({
        userMessage,
        oldMessage,
        subscription,
        chat,
        user,
        employee,
        keyEncryptionKey,
        locale,
        platform: determinedPlatform,
        sentPlatform: platform
      })
    } else if (isReplicateImageModel(chat.model)) {
      message = await service.message.replicateImage.regenerate({
        oldMessage,
        userMessage,
        subscription,
        chat,
        user,
        employee,
        keyEncryptionKey,
        platform: determinedPlatform,
        sentPlatform: platform
      })
    } else if (isImageModel(chat.model)) {
      message = await service.message.image.regenerate({
        userMessage,
        oldMessage,
        subscription,
        chat,
        user,
        employee,
        keyEncryptionKey,
        platform: determinedPlatform,
        sentPlatform: platform
      })
    } else {
      throw new ForbiddenError({
        code: 'INVALID_MODEL',
        message: 'The model does not support regeneration'
      })
    }

    return message
  }
