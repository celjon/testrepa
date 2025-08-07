import { FileType, MessageButtonAction, MessageStatus, Platform } from '@prisma/client'
import { config } from '@/config'
import { getErrorString } from '@/lib'
import { logger } from '@/lib/logger'
import { Adapter } from '@/domain/types'
import { ChatService } from '@/domain/service/chat'
import { IChat } from '@/domain/entity/chat'
import { ForbiddenError, InvalidDataError, NotFoundError } from '@/domain/errors'
import { ISubscription } from '@/domain/entity/subscription'
import { IMessageImage } from '@/domain/entity/message-image'
import { JobService } from '@/domain/service/job'
import { IMessage } from '@/domain/entity/message'
import { SubscriptionService } from '@/domain/service/subscription'
import { IUser } from '@/domain/entity/user'
import { UserService } from '@/domain/service/user'
import { ModerationService } from '@/domain/service/moderation'
import { ModelService } from '@/domain/service/model'
import { FileService } from '@/domain/service/file'
import { isFlux, isStableDiffusion } from '@/domain/entity/model'
import { SendReplicateImageByProvider } from './send-by-provider'
import { MessageStorage } from '../storage/types'
import { TransalatePrompt } from '../translate-prompt'
import { IEmployee } from '@/domain/entity/employee'

type Params = Adapter & {
  sendImageByProvider: SendReplicateImageByProvider
  translatePrompt: TransalatePrompt
  chatService: ChatService
  jobService: JobService
  subscriptionService: SubscriptionService
  userService: UserService
  moderationService: ModerationService
  modelService: ModelService
  messageStorage: MessageStorage
  fileService: FileService
}

export type RegenerateReplicateImage = (params: {
  userMessage?: IMessage | null
  oldMessage: IMessage
  chat: IChat
  user: IUser
  employee: IEmployee | null
  keyEncryptionKey: string | null
  subscription: ISubscription
  maxAllowedSetLength?: number
  platform?: Platform
  sentPlatform?: Platform
  developerKeyId?: string
}) => Promise<IMessage>

export const buildRegenerateReplicateImage = ({
  sendImageByProvider,
  translatePrompt,
  messageStorage,
  messageImageRepository,
  chatService,
  subscriptionService,
  chatRepository,
  imageGateway,
  jobService,
  userService,
  moderationService,
  modelService,
  modelRepository,
  messageSetRepository,
  cryptoGateway,
  fileService,
}: Params): RegenerateReplicateImage => {
  return async ({
    userMessage,
    oldMessage,
    chat,
    user,
    employee,
    keyEncryptionKey,
    subscription,
    maxAllowedSetLength = 5,
    platform,
    developerKeyId,
  }) => {
    const { settings } = chat

    if (!settings || !settings.replicateImage) {
      throw new NotFoundError({
        code: 'SETTINGS_NOT_FOUND',
        message: 'Settings "replicateImage" not found',
      })
    }

    const replicateImageSettings = settings.replicateImage
    const model =
      (await modelRepository.get({
        where: {
          id: replicateImageSettings.model,
        },
      })) ??
      chat.model ??
      null

    if (!model) {
      throw new NotFoundError({
        code: 'MODEL_NOT_FOUND',
        message: `Model ${replicateImageSettings.model} not found`,
      })
    }

    if (!userMessage) {
      throw new InvalidDataError({
        code: 'MESSAGE_NOT_FOUND',
        message: 'User message with prompt for regeneration not received',
      })
    }

    let set

    if (!oldMessage.set) {
      set = await messageSetRepository.create({
        data: {
          chat_id: chat.id,
          messages: {
            connect: {
              id: oldMessage.id,
            },
          },
          last_id: oldMessage.id,
          choiced: oldMessage.id,
        },
        include: {
          last: true,
        },
      })

      oldMessage =
        (await messageStorage.update({
          user: user,
          keyEncryptionKey,
          data: {
            where: {
              id: oldMessage.id,
            },
            data: {
              choiced: false,
              set_id: set.id,
            },
          },
        })) ?? oldMessage
    } else {
      set = await messageSetRepository.get({
        where: {
          id: oldMessage.set_id!,
        },
        include: {
          last: true,
        },
      })

      if (set && set.length >= maxAllowedSetLength) {
        throw new ForbiddenError({
          code: 'MESSAGE_SET_LIMIT_REACHED',
          message: 'Message regeneration limit reached',
          data: {
            maxAllowedSetLength,
          },
        })
      }
    }

    if (set?.last) oldMessage = set.last
    else
      throw new NotFoundError({
        code: 'LAST_VERSION_NOT_FOUND',
        message: 'Last message version not found',
      })

    const imageJob = await jobService.create({
      name: 'MODEL_GENERATION',
      chat,
    })

    let imageMessage = await messageStorage.create({
      user,
      keyEncryptionKey,
      data: {
        data: {
          role: 'assistant',
          status: MessageStatus.PENDING,
          chat_id: chat.id,
          user_id: user.id,
          model_id: model.id,
          job_id: imageJob.id,
          created_at: new Date(userMessage.created_at.getTime() + 1),
          choiced: true,
          set_id: set!.id,
          previous_version_id: oldMessage.id,
          version: oldMessage.version + 1,
        },
      },
    })

    set = await messageSetRepository.update({
      where: {
        id: set?.id,
      },
      data: {
        choiced: imageMessage.id,
        last: {
          connect: {
            id: imageMessage.id,
          },
        },
        length: {
          increment: 1,
        },
      },
    })

    oldMessage =
      (await messageStorage.update({
        user,
        keyEncryptionKey,
        data: {
          where: {
            id: oldMessage.id,
          },
          data: {
            choiced: false,
            next_version: {
              connect: {
                id: imageMessage.id,
              },
            },
          },
        },
      })) ?? oldMessage

    imageMessage =
      (await messageStorage.get({
        user,
        keyEncryptionKey,
        data: {
          where: {
            id: imageMessage.id,
          },
          include: {
            set: true,
            model: {
              include: {
                icon: true,
                parent: {
                  include: {
                    icon: true,
                  },
                },
              },
            },
            job: true,
          },
        },
      })) ?? imageMessage

    chatService.eventStream.emit({
      chat,
      event: {
        name: 'MESSAGE_RECREATE',
        data: {
          oldMessage,
          newMessage: imageMessage,
        },
      },
    })
    ;(async () => {
      try {
        await moderationService.moderate({
          userId: user.id,
          messageId: userMessage.id,
          content: userMessage.content ?? '',
        })

        let userMessageContent = userMessage.content
        const isRussian = userMessageContent?.match(/[А-ЯЁа-яё]{2}/)

        if ((isFlux(model) || isStableDiffusion(model)) && isRussian && userMessageContent) {
          userMessageContent = await translatePrompt({ content: userMessageContent })
        }

        let negativePrompt = replicateImageSettings.negative_prompt
        const negativePromptInRussian = negativePrompt.match(/[А-ЯЁа-яё]{2}/)

        if (
          (isFlux(model) || isStableDiffusion(model)) &&
          negativePromptInRussian &&
          negativePrompt
        ) {
          negativePrompt = await translatePrompt({ content: negativePrompt })
        }

        const caps = await modelService.getCaps.image({
          model,
          settings,
        })

        await imageJob.start()

        chatService.eventStream.emit({
          chat,
          event: {
            name: 'MESSAGE_UPDATE',
            data: {
              message: {
                id: imageMessage.id,
                job_id: imageJob.id,
                job: imageJob.job,
              },
            },
          },
        })

        const images = await sendImageByProvider({
          providerId: null,
          model,
          message: {
            ...userMessage,
            content: userMessageContent,
          },
          settings: {
            ...replicateImageSettings,
            negative_prompt: negativePrompt,
          },
          endUserId: user.id,
        })

        let dek = null
        if (user.encryptedDEK && user.useEncryption && keyEncryptionKey) {
          dek = await cryptoGateway.decryptDEK({
            edek: user.encryptedDEK as Buffer,
            kek: keyEncryptionKey,
          })
        }

        const messageImages: IMessageImage[] = await Promise.all(
          images.map(async (image) => {
            const originalImage = await fileService.write({
              buffer: image.buffer,
              ext: image.ext,
              dek,
            })
            const { width: originalImageWidth = 1024, height: originalImageHeight = 1024 } =
              await imageGateway.metadata({
                buffer: originalImage.buffer,
              })

            const {
              buffer: previewImageBuffer,
              info: { width: previewImageWidth, height: previewImageHeight },
            } = await imageGateway.resize({
              buffer: image.buffer,
              width: 512,
            })
            const previewImage = await fileService.write({
              buffer: previewImageBuffer,
              ext: image.ext,
              dek,
            })

            const messageImage = await messageImageRepository.create({
              data: {
                width: originalImageWidth,
                height: originalImageHeight,
                preview_width: previewImageWidth,
                preview_height: previewImageHeight,
                original: {
                  create: {
                    type: FileType.IMAGE,
                    name: originalImage.name,
                    path: originalImage.path,
                    isEncrypted: originalImage.isEncrypted,
                  },
                },
                preview: {
                  create: {
                    type: FileType.IMAGE,
                    name: previewImage.name,
                    path: previewImage.path,
                    isEncrypted: previewImage.isEncrypted,
                  },
                },
                buttons: {
                  createMany: {
                    data: [
                      {
                        message_id: imageMessage.id,
                        action: MessageButtonAction.DOWNLOAD,
                      },
                    ],
                  },
                },
              },
            })

            return messageImage
          }),
        )

        await imageJob.done()

        const writeOffResult = await subscriptionService.writeOffWithLimitNotification({
          subscription,
          amount: caps,
          meta: {
            userId: user.id,
            enterpriseId: employee?.enterprise_id,
            platform,
            model_id: model.id,
            provider_id: config.model_providers.replicate.id,
            developerKeyId,
          },
        })
        const { transaction } = writeOffResult

        subscription = writeOffResult.subscription

        chat =
          (await chatRepository.update({
            where: { id: chat.id },
            data: {
              total_caps: {
                increment: caps,
              },
            },
          })) ?? chat

        imageMessage =
          (await messageStorage.update({
            user,
            keyEncryptionKey,
            data: {
              where: { id: imageMessage.id },
              data: {
                status: MessageStatus.DONE,
                transaction_id: transaction.id,
                images: {
                  connect: messageImages.map(({ id }) => ({
                    id,
                  })),
                },
              },
              include: {
                set: true,
                transaction: true,
                model: {
                  include: {
                    icon: true,
                    parent: {
                      include: {
                        icon: true,
                      },
                    },
                  },
                },
                images: {
                  include: {
                    original: true,
                    preview: true,
                    buttons: true,
                  },
                },
                buttons: true,
                all_buttons: {
                  distinct: ['action'],
                },
                job: true,
              },
            },
          })) ?? imageMessage

        chatService.eventStream.emit({
          chat,
          event: {
            name: 'UPDATE',
            data: {
              chat: {
                total_caps: chat.total_caps,
              },
            },
          },
        })
        chatService.eventStream.emit({
          chat,
          event: {
            name: 'MESSAGE_UPDATE',
            data: {
              message: imageMessage,
            },
          },
        })
        chatService.eventStream.emit({
          chat,
          event: {
            name: 'TRANSACTION_CREATE',
            data: {
              transaction,
            },
          },
        })

        chatService.eventStream.emit({
          chat,
          event: {
            name: userService.hasEnterpriseActualSubscription(user)
              ? 'ENTERPRISE_SUBSCRIPTION_UPDATE'
              : 'SUBSCRIPTION_UPDATE',
            data: {
              subscription: {
                id: subscription.id,
                balance: subscription.balance,
              },
            },
          },
        })
      } catch (error) {
        await imageJob.setError(error)

        chatService.eventStream.emit({
          chat,
          event: {
            name: 'MESSAGE_UPDATE',
            data: {
              message: {
                id: imageMessage.id,
                job_id: imageJob.id,
                job: imageJob.job,
              },
            },
          },
        })

        logger.error({
          location: 'renegerateReplicateImage',
          message: getErrorString(error),
          userId: user.id,
          email: user.email ?? user.tg_id,
          chatId: chat.id,
          modelId: model.id,
        })
      }
    })()

    return imageMessage
  }
}
