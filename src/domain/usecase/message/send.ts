import { ForbiddenError, InvalidDataError, NotFoundError } from '@/domain/errors'
import { UseCaseParams } from '../types'
import {
  isImageModel,
  isMidjourney,
  isReplicateImageModel,
  isSpeechToTextModel,
  isTextModel,
  isTextToSpeechModel,
  isVideoModel,
} from '@/domain/entity/model'
import { IMessage } from '@/domain/entity/message'
import { Platform } from '@prisma/client'
import { determinePlatform } from '@/domain/entity/action'
import { RawFile } from '@/domain/entity/file'

type EndCallback = (params: { userMessage: IMessage; assistantMessage: IMessage | null }) => unknown

export type Send = (params: {
  chatId: string
  userId: string
  keyEncryptionKey: string | null
  message: string
  files: RawFile[]
  videoFile: RawFile | null
  voiceFile: RawFile | null
  platform?: Platform
  locale: string
  regenerate?: string
  stream: boolean
  developerKeyId?: string
  prefix?: string
}) => Promise<IMessage>

export const buildSend =
  ({ adapter, service }: UseCaseParams): Send =>
  async ({
    chatId,
    userId,
    keyEncryptionKey,
    message: content,
    files,
    voiceFile,
    videoFile,
    platform,
    locale,
    regenerate,
    stream,
    developerKeyId,
    prefix,
  }) => {
    let chat = await adapter.chatRepository.get({
      where: {
        id: chatId,
        user_id: userId,
        deleted: false,
      },
      include: {
        model: true,
      },
    })

    if (!chat) {
      throw new NotFoundError({
        code: 'CHAT_NOT_FOUND',
      })
    }

    chat = await adapter.chatRepository.get({
      where: {
        id: chatId,
        user_id: userId,
        deleted: false,
      },
      include: {
        user: {
          include: {
            employees: {
              include: {
                enterprise: true,
              },
            },
          },
        },
        model: true,
        model_function: true,
        ...(chat.model && {
          settings: {
            include: {
              text: isTextModel(chat.model),
              image: isImageModel(chat.model),
              mj: isMidjourney(chat.model),
              replicateImage: isReplicateImageModel(chat.model),
              speech: isTextToSpeechModel(chat.model),
              stt: isSpeechToTextModel(chat.model),
              video: isVideoModel(chat.model),
            },
          },
        }),
        ...(!chat.model && {
          settings: true,
        }),
      },
    })

    if (!chat || !chat.settings || !chat.user) {
      throw new NotFoundError({
        code: 'CHAT_NOT_FOUND',
      })
    }
    const { user } = chat
    const subscription = await service.user.getActualSubscriptionById(user.id)
    await service.subscription.checkBalance({ subscription, estimate: 0 })

    const employee = await adapter.employeeRepository.get({
      where: { user_id: userId },
    })
    await service.enterprise.checkMonthLimit({ userId })
    const { plan } = subscription!

    if (
      !chat.model ||
      !(await service.model.isAllowed({
        plan: plan!,
        modelId: chat.model.id,
      }))
    ) {
      const defaultModel = await service.model.getDefault({
        plan: plan!,
      })

      if (!defaultModel) {
        throw new NotFoundError({ code: 'DEFAULT_MODEL_NOT_FOUND' })
      }

      await adapter.chatRepository.update({
        where: {
          id: chatId,
        },
        data: {
          model_id: defaultModel.id,
        },
      })

      chat.model = defaultModel
      chat.model_id = defaultModel.id
    }

    chat.settings = await service.chat.settings.upsert({
      chat,
      parentModel: chat.model,
      plan: plan!,
      disableUpdate: true,
    })

    let userMessage: IMessage

    if (regenerate) {
      const message = await service.message.storage.get({
        user,
        keyEncryptionKey,
        data: {
          where: {
            id: regenerate,
          },
          include: {
            user: true,
          },
        },
      })

      if (!message) {
        throw new NotFoundError({
          code: 'MESSAGE_NOT_FOUND',
          message: 'Message for regeneration not found',
        })
      }

      userMessage = message
    } else {
      userMessage = await service.message.storage.create({
        user,
        keyEncryptionKey,
        data: {
          data: {
            role: 'user',
            chat_id: chat.id,
            user_id: userId,
            content,
          },
          include: {
            user: true,
          },
        },
      })

      service.chat.eventStream.emit({
        chat,
        event: {
          name: 'MESSAGE_CREATE',
          data: {
            message: userMessage,
          },
        },
      })
    }

    const determinedPlatform = determinePlatform(platform, !!employee?.enterprise_id)

    let { hasAccess, reasonCode } = await service.plan.hasAccess(
      subscription!.plan!,
      chat.model.id,
      employee?.id,
    )

    const parentModelId = chat.model.id
    let childModelId = null

    // check access for child models
    if (isTextModel(chat.model) && chat.settings.text) {
      const access = await service.plan.hasAccess(
        subscription!.plan!,
        chat.settings.text.model,
        employee?.id,
      )
      hasAccess = access.hasAccess
      reasonCode = access.reasonCode

      childModelId = chat.settings.text.model
    } else if (isReplicateImageModel(chat.model) && chat.settings.replicateImage) {
      const access = await service.plan.hasAccess(
        subscription!.plan!,
        chat.settings.replicateImage.model,
        employee?.id,
      )
      hasAccess = access.hasAccess
      reasonCode = access.reasonCode

      childModelId = chat.settings.replicateImage.model
    } else if (isVideoModel(chat.model) && chat.settings.video) {
      const access = await service.plan.hasAccess(
        subscription!.plan!,
        chat.settings.video.model,
        employee?.id,
      )
      hasAccess = access.hasAccess
      reasonCode = access.reasonCode

      childModelId = chat.settings.video.model
    } else if (isImageModel(chat.model) && chat.settings.image) {
      const access = await service.plan.hasAccess(
        subscription!.plan!,
        chat.settings.image.model,
        employee?.id,
      )
      hasAccess = access.hasAccess
      reasonCode = access.reasonCode

      childModelId = chat.settings.image.model
    } else if (isTextToSpeechModel(chat.model) && chat.settings.speech) {
      const access = await service.plan.hasAccess(
        subscription!.plan!,
        chat.settings.speech.model,
        employee?.id,
      )
      hasAccess = access.hasAccess
      reasonCode = access.reasonCode

      childModelId = chat.settings.speech.model
    } else if (isSpeechToTextModel(chat.model) && chat.settings.stt) {
      const access = await service.plan.hasAccess(
        subscription!.plan!,
        chat.settings.stt.model,
        employee?.id,
      )
      hasAccess = access.hasAccess
      reasonCode = access.reasonCode

      childModelId = chat.settings.stt.model
    }

    await service.model.incrementUsage({
      modelIds: [parentModelId, ...(childModelId ? [childModelId] : [])],
    })

    if (!hasAccess) {
      throw new ForbiddenError({
        code: reasonCode ?? 'MODEL_NOT_ALLOWED_FOR_PLAN',
      })
    }

    const handleEnd: EndCallback = async ({ userMessage, assistantMessage }) => {
      if (typeof chat.name === 'string' && !chat.initial) {
        return
      }

      const chatName = await service.chat.generateName({
        user,
        messages: [userMessage, ...(assistantMessage ? [assistantMessage] : [])],
      })

      await adapter.chatRepository.update({
        where: {
          id: chat.id,
        },
        data: {
          name: chatName,
          initial: false,
        },
      })

      service.chat.eventStream.emit({
        chat,
        event: {
          name: 'UPDATE',
          data: {
            chat: {
              name: chatName,
              initial: false,
            },
          },
        },
      })
    }
    let message: IMessage
    if (isTextModel(chat.model)) {
      message = await service.message.text.send({
        subscription: subscription!,
        chat,
        user,
        employee,
        keyEncryptionKey,
        userMessage,
        files,
        voiceFile,
        videoFile,
        platform: determinedPlatform,
        sentPlatform: platform,
        locale,
        onEnd: handleEnd,
        stream,
        developerKeyId,
        prefix,
      })
    } else if (isMidjourney(chat.model)) {
      message = await service.message.midjourney.send({
        userMessage,
        subscription: subscription!,
        chat,
        user,
        employee,
        keyEncryptionKey,
        files,
        voiceFile,
        platform: determinedPlatform,
        sentPlatform: platform,
        onEnd: handleEnd,
        stream,
        developerKeyId,
      })
    } else if (isReplicateImageModel(chat.model)) {
      message = await service.message.replicateImage.send({
        userMessage,
        subscription: subscription!,
        chat,
        user,
        employee,
        keyEncryptionKey,
        files,
        voiceFile,
        platform: determinedPlatform,
        sentPlatform: platform,
        onEnd: handleEnd,
        stream,
        developerKeyId,
      })
    } else if (isVideoModel(chat.model)) {
      message = await service.message.video.send({
        userMessage,
        subscription: subscription!,
        chat,
        user,
        employee,
        keyEncryptionKey,
        files,
        voiceFile,
        platform: determinedPlatform,
        sentPlatform: platform,
        onEnd: handleEnd,
        stream,
        developerKeyId,
      })
    } else if (isImageModel(chat.model)) {
      message = await service.message.image.send({
        userMessage,
        subscription: subscription!,
        chat,
        user,
        employee,
        keyEncryptionKey,
        files,
        voiceFile,
        platform: determinedPlatform,
        sentPlatform: platform,
        onEnd: handleEnd,
        stream,
        developerKeyId,
      })
    } else if (isTextToSpeechModel(chat.model)) {
      message = await service.message.speech.send({
        userMessage,
        subscription: subscription!,
        chat,
        keyEncryptionKey,
        user,
        employee,
        platform: determinedPlatform,
        sentPlatform: platform,
        onEnd: handleEnd,
        stream,
        developerKeyId,
      })
    } else if (isSpeechToTextModel(chat.model)) {
      message = await service.message.speech2text.send({
        userMessage,
        subscription: subscription!,
        chat,
        voiceFile,
        videoFile,
        keyEncryptionKey,
        user,
        platform: determinedPlatform,
        sentPlatform: platform,
        onEnd: handleEnd,
        developerKeyId,
      })
    } else {
      throw new InvalidDataError({
        code: 'INVALID_MODEL',
        message: 'Model is not supported',
      })
    }

    return message
  }
