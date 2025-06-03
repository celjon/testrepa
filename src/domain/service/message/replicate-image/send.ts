import { FileType, MessageButtonAction, MessageStatus, Platform } from '@prisma/client'
import { logger } from '@/lib/logger'
import { Adapter } from '@/domain/types'
import { ChatService } from '../../chat'
import { IChat } from '@/domain/entity/chat'
import { NotFoundError } from '@/domain/errors'
import { ISubscription } from '@/domain/entity/subscription'
import { IMessageImage } from '@/domain/entity/messageImage'
import { JobService } from '../../job'
import { IMessage } from '@/domain/entity/message'
import { SubscriptionService } from '../../subscription'
import { IUser } from '@/domain/entity/user'
import { UserService } from '../../user'
import { ModerationService } from '../../moderation'
import { ModelService } from '../../model'
import { SendReplicateImageByProvider } from './send-by-provider'
import { isFlux, isStableDiffusion } from '@/domain/entity/model'
import { UploadVoice } from '../upload/voice'
import { UploadFiles } from '../upload/files'
import { RawFile } from '@/domain/entity/file'
import { MessageStorage } from '../storage/types'
import { FileService } from '../../file'
import { TransalatePrompt } from '../translatePrompt'
import { IEmployee } from '@/domain/entity/employee'

type Params = Adapter & {
  sendImageByProvider: SendReplicateImageByProvider
  uploadFiles: UploadFiles
  uploadVoice: UploadVoice
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

export type SendReplicateImage = (params: {
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

export const buildSendReplicateImage = ({
  sendImageByProvider,
  uploadFiles,
  uploadVoice,
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
  cryptoGateway,
  fileService
}: Params): SendReplicateImage => {
  return async ({ userMessage, chat, user, employee, keyEncryptionKey, subscription, files, voiceFile, platform, onEnd, stream }) => {
    const { settings } = chat

    if (!settings || !settings.replicateImage) {
      throw new NotFoundError({
        code: 'SETTINGS_NOT_FOUND',
        message: 'Settings "replicateImage" not found'
      })
    }

    const replicateImageSettings = settings.replicateImage
    const model =
      (await modelRepository.get({
        where: {
          id: replicateImageSettings.model
        }
      })) ??
      chat.model ??
      null

    if (!model) {
      throw new NotFoundError({
        code: 'MODEL_NOT_FOUND',
        message: `Model ${replicateImageSettings.model} not found`
      })
    }

    const imageJob = await jobService.create({
      name: 'MODEL_GENERATION',
      chat
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
        const [{ userMessageImages, userMessageAttachmentsFiles }, { userMessageVoice }] = await Promise.all([
          uploadFiles({ files, user, keyEncryptionKey }),
          uploadVoice({ voiceFile, user, keyEncryptionKey })
        ])

        userMessage =
          (await messageStorage.update({
            user,
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

        let userMessageContent = `${userMessage.full_content ?? userMessage.content ?? ''} ${userMessage.voice?.content ?? ''} ${userMessage.video?.content ?? ''}`

        await moderationService.moderate({
          userId: user.id,
          messageId: userMessage.id,
          content: userMessageContent ?? ''
        })

        const isRussian = userMessageContent?.match(/[А-ЯЁа-яё]{2}/)

        if ((isFlux(model) || isStableDiffusion(model)) && isRussian && userMessageContent) {
          userMessageContent = await translatePrompt({ content: userMessageContent })
        }

        let negativePrompt = replicateImageSettings.negative_prompt
        const negativePromptInRussian = negativePrompt.match(/[А-ЯЁа-яё]{2}/)

        if ((isFlux(model) || isStableDiffusion(model)) && negativePromptInRussian && negativePrompt) {
          negativePrompt = await translatePrompt({ content: negativePrompt })
        }

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

        const images = await sendImageByProvider({
          providerId: null,
          model,
          message: {
            ...userMessage,
            content: userMessageContent
          },
          settings: {
            ...replicateImageSettings,
            negative_prompt: negativePrompt
          },
          endUserId: user.id
        })

        let dek = null
        if (user.encryptedDEK && user.useEncryption && keyEncryptionKey) {
          dek = await cryptoGateway.decryptDEK({
            edek: user.encryptedDEK as Buffer,
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
          settings
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
            where: { id: chat.id },
            data: {
              total_caps: {
                increment: caps
              }
            }
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
        logger.error('SendReplicateImage', error, {
          userId: user.id,
          email: user.email ?? user.tg_id,
          chatId: chat.id
        })
        await imageJob.setError(error)

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

        onEnd?.({
          userMessage,
          assistantMessage: imageMessage
        })

        throw error
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
