import { Adapter } from '@/domain/types'
import { FileType, MessageButtonAction, MessageStatus, Platform } from '@prisma/client'
import { logger } from '@/lib/logger'
import { BaseError, InternalError, NotFoundError } from '@/domain/errors'
import { IChat } from '@/domain/entity/chat'
import { ISubscription } from '@/domain/entity/subscription'
import { IMessageImage } from '@/domain/entity/messageImage'
import { IMessage } from '@/domain/entity/message'
import { IUser } from '@/domain/entity/user'
import { RawFile } from '@/domain/entity/file'
import { IEmployee } from '@/domain/entity/employee'
import { ChatService } from '../../chat'
import { JobService } from '../../job'
import { SubscriptionService } from '../../subscription'
import { UserService } from '../../user'
import { ModerationService } from '../../moderation'
import { ModelService } from '../../model'
import { SendImageByProvider } from './sendByProvider'
import { UploadFiles } from '../upload/files'
import { UploadVoice } from '../upload/voice'
import { MessageStorage } from '../storage/types'
import { FileService } from '../../file'

type Params = Adapter & {
  sendImageByProvider: SendImageByProvider
  uploadFiles: UploadFiles
  uploadVoice: UploadVoice
  chatService: ChatService
  jobService: JobService
  subscriptionService: SubscriptionService
  userService: UserService
  moderationService: ModerationService
  modelService: ModelService
  messageStorage: MessageStorage
  fileService: FileService
}

export type SendImage = (params: {
  userMessage: IMessage
  chat: IChat
  user: IUser
  employee: IEmployee | null
  keyEncryptionKey: string | null
  subscription: ISubscription
  files: RawFile[]
  voiceFile?: RawFile | null
  platform?: Platform
  sentPlatform?: Platform
  onEnd?: (params: { userMessage: IMessage; assistantMessage: IMessage | null }) => unknown
  stream: boolean
}) => Promise<IMessage>

export const buildSendImage = ({
  sendImageByProvider,
  uploadFiles,
  uploadVoice,
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
  cryptoGateway,
  fileService
}: Params): SendImage => {
  return async ({ userMessage, chat, user, employee, keyEncryptionKey, subscription, files, voiceFile, platform, onEnd, stream }) => {
    const { settings } = chat

    if (!settings || !settings.image) {
      throw new NotFoundError({
        code: 'SETTINGS_NOT_FOUND'
      })
    }

    const imageSettings = settings.image
    const model =
      (await modelRepository.get({
        where: {
          id: imageSettings.model
        }
      })) ??
      chat.model ??
      null

    if (!model) {
      throw new NotFoundError({
        code: 'MODEL_NOT_FOUND'
      })
    }

    const imageJob = await jobService.create({
      name: 'MODEL_GENERATION',
      chat
    })

    let imageMessage = await messageStorage.create({
      user: user,
      keyEncryptionKey,
      data: {
        data: {
          role: 'assistant',
          status: MessageStatus.PENDING,
          chat_id: chat.id,
          user_id: user.id,
          model_id: model.id,
          job_id: imageJob.id,
          created_at: new Date(userMessage.created_at.getTime() + 1)
        },
        include: {
          model: {
            include: {
              icon: true,
              parent: {
                include: {
                  icon: true
                }
              }
            }
          },
          job: true
        }
      }
    })

    chatService.eventStream.emit({
      chat,
      event: {
        name: 'MESSAGE_CREATE',
        data: {
          message: imageMessage
        }
      }
    })
    const updateImageMessage = async () => {
      try {
        await moderationService.moderate({
          userId: user.id,
          messageId: userMessage.id,
          content: userMessage.content ?? ''
        })

        const [{ userMessageImages, userMessageAttachmentsFiles }, { userMessageVoice }] = await Promise.all([
          uploadFiles({ files, user, keyEncryptionKey }),
          uploadVoice({ voiceFile, user, keyEncryptionKey })
        ])

        userMessage =
          (await messageStorage.update({
            user: user,
            keyEncryptionKey,
            data: {
              where: {
                id: userMessage.id
              },
              data: {
                images: {
                  connect: userMessageImages.map(({ id }) => ({ id }))
                },
                attachments: {
                  createMany: {
                    data: userMessageAttachmentsFiles.map((userMessageAttachmentFile) => ({
                      file_id: userMessageAttachmentFile.id
                    }))
                  }
                },
                ...(userMessageVoice && {
                  voice_id: userMessageVoice.id
                }),
                platform
              },
              include: {
                user: true,
                images: {
                  include: {
                    original: true,
                    preview: true,
                    buttons: true
                  }
                },
                attachments: {
                  include: {
                    file: true
                  }
                },
                voice: {
                  include: {
                    file: true
                  }
                }
              }
            }
          })) ?? userMessage

        chatService.eventStream.emit({
          chat,
          event: {
            name: 'MESSAGE_UPDATE',
            data: {
              message: userMessage
            }
          }
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
                job: imageJob.job
              }
            }
          }
        })

        const { images, usage } = await sendImageByProvider({
          providerId: null,
          model,
          message: userMessage,
          settings: imageSettings,
          endUserId: user.id
        })

        let dek = null
        if (user.encryptedDEK && user.useEncryption && keyEncryptionKey) {
          dek = await cryptoGateway.decryptDEK({
            edek: user.encryptedDEK,
            kek: keyEncryptionKey
          })
        }

        const messageImages: IMessageImage[] = await Promise.all(
          images.map(async (image) => {
            const originalImage = await fileService.write({
              buffer: image.buffer,
              ext: image.ext,
              dek
            })
            const { width: originalImageWidth = 1024, height: originalImageHeight = 1024 } = await imageGateway.metadata({
              buffer: image.buffer
            })

            const {
              buffer: previewImageBuffer,
              info: { width: previewImageWidth, height: previewImageHeight }
            } = await imageGateway.resize({
              buffer: image.buffer,
              width: 512
            })

            const previewImage = await fileService.write({
              buffer: previewImageBuffer,
              ext: image.ext,
              dek
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
                    isEncrypted: originalImage.isEncrypted
                  }
                },
                preview: {
                  create: {
                    type: FileType.IMAGE,
                    name: previewImage.name,
                    path: previewImage.path,
                    isEncrypted: previewImage.isEncrypted
                  }
                },
                buttons: {
                  createMany: {
                    data: [
                      {
                        message_id: imageMessage.id,
                        action: MessageButtonAction.DOWNLOAD
                      }
                    ]
                  }
                }
              }
            })

            return messageImage
          })
        )

        await imageJob.done()

        const caps = await modelService.getCaps({
          model,
          settings,
          usage: usage ?? undefined
        })

        const writeOffResult = await subscriptionService.writeOffWithLimitNotification({
          subscription,
          amount: caps,
          meta: {
            userId: user.id,
            enterpriseId: employee?.enterprise_id,
            platform,
            model_id: model.id
          }
        })
        const { transaction } = writeOffResult

        subscription = writeOffResult.subscription

        chat =
          (await chatRepository.update({
            where: {
              id: chat.id
            },
            data: {
              total_caps: {
                increment: caps
              }
            }
          })) ?? chat

        imageMessage =
          (await messageStorage.update({
            user: user,
            keyEncryptionKey,
            data: {
              where: {
                id: imageMessage.id
              },
              data: {
                status: MessageStatus.DONE,
                transaction_id: transaction.id,
                images: {
                  connect: messageImages.map(({ id }) => ({
                    id
                  }))
                }
              },
              include: {
                transaction: true,
                model: {
                  include: {
                    icon: true,
                    parent: {
                      include: {
                        icon: true
                      }
                    }
                  }
                },
                images: {
                  include: {
                    original: true,
                    preview: true,
                    buttons: true
                  }
                },
                buttons: true,
                all_buttons: {
                  distinct: ['action']
                },
                job: true
              }
            }
          })) ?? imageMessage

        chatService.eventStream.emit({
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
        chatService.eventStream.emit({
          chat,
          event: {
            name: 'MESSAGE_UPDATE',
            data: {
              message: imageMessage
            }
          }
        })
        chatService.eventStream.emit({
          chat,
          event: {
            name: 'TRANSACTION_CREATE',
            data: {
              transaction
            }
          }
        })

        chatService.eventStream.emit({
          chat,
          event: {
            name: userService.hasEnterpriseActualSubscription(user) ? 'ENTERPRISE_SUBSCRIPTION_UPDATE' : 'SUBSCRIPTION_UPDATE',
            data: {
              subscription: {
                id: subscription.id,
                balance: subscription.balance
              }
            }
          }
        })

        onEnd?.({
          userMessage,
          assistantMessage: imageMessage
        })
      } catch (error) {
        let err = error
        if (!(error instanceof BaseError)) {
          err = new InternalError({
            code: 'INTERNAL_ERROR'
          })
          logger.error('sendImage', error, {
            userId: user.id,
            email: user.email ?? user.tg_id,
            chatId: chat.id
          })
        }
        const errorJob = await imageJob.setError(err)

        chatService.eventStream.emit({
          chat,
          event: {
            name: 'MESSAGE_UPDATE',
            data: {
              message: {
                id: imageMessage.id,
                job_id: errorJob.id,
                job: errorJob
              }
            }
          }
        })

        onEnd?.({
          userMessage,
          assistantMessage: imageMessage
        })

        throw err
      }
    }

    if (stream) {
      // Do not need to handle errors in stream mode
      updateImageMessage().catch(() => {})
    } else {
      await updateImageMessage()
    }

    return imageMessage
  }
}
