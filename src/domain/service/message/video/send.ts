import { FileType, MessageStatus, Platform } from '@prisma/client'
import { logger } from '@/lib/logger'
import { Adapter } from '@/domain/types'
import { ChatService } from '../../chat'
import { IChat } from '@/domain/entity/chat'
import { ForbiddenError, NotFoundError } from '@/domain/errors'
import { ISubscription } from '@/domain/entity/subscription'
import { JobService } from '../../job'
import { IMessage } from '@/domain/entity/message'
import { SubscriptionService } from '../../subscription'
import { IUser } from '@/domain/entity/user'
import { UserService } from '../../user'
import { ModerationService } from '../../moderation'
import { ModelService } from '../../model'
import { UploadVoice } from '../upload/voice'
import { UploadFiles } from '../upload/files'
import { MessageStorage } from '../storage/types'
import { FileService } from '../../file'
import { TransalatePrompt } from '../translatePrompt'
import { IEmployee } from '@/domain/entity/employee'
import { RawFile } from '@/domain/entity/file'
import { SendVideoByProvider } from './sendByProvider'

type Params = Adapter & {
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
  sendVideoByProvider: SendVideoByProvider
}

export type SendVideo = (params: {
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

export const buildSendVideo = ({
  uploadFiles,
  uploadVoice,
  translatePrompt,
  sendVideoByProvider,
  messageStorage,
  messageImageRepository,
  chatService,
  subscriptionService,
  chatRepository,
  jobService,
  userService,
  moderationService,
  modelService,
  modelRepository,
  cryptoGateway,
  fileService,
  videoRepository
}: Params): SendVideo => {
  return async ({ userMessage, chat, user, employee, keyEncryptionKey, subscription, files, voiceFile, platform, onEnd, stream }) => {
    const { settings } = chat
    if (!settings || !settings.video) {
      throw new NotFoundError({
        code: 'SETTINGS_NOT_FOUND',
        message: 'Settings "replicateVideo" not found'
      })
    }
    const videoSettings = settings.video
    const model =
      (await modelRepository.get({
        where: {
          id: videoSettings.model
        }
      })) ??
      chat.model ??
      null

    if (!model) {
      throw new NotFoundError({
        code: 'MODEL_NOT_FOUND',
        message: `Model ${videoSettings.model} not found`
      })
    }

    const videoJob = await jobService.create({
      name: 'MODEL_GENERATION',
      chat
    })

    let videoMessage = await messageStorage.create({
      user,
      keyEncryptionKey,
      data: {
        data: {
          role: 'assistant',
          status: MessageStatus.PENDING,
          chat_id: chat.id,
          user_id: user.id,
          model_id: model.id,
          job_id: videoJob.id,
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
          message: videoMessage
        }
      }
    })
    const updateVideoMessage = async () => {
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
        if (userMessage.images) {
          const { flagged: isNFSW } = await moderationService.visionModerate({
            imagePaths: userMessage.images.map((image) => image.original?.path).filter((url) => !!url) as string[],
            userId: user.id
          })

          if (isNFSW) {
            await Promise.all([
              messageStorage.update({
                user,
                keyEncryptionKey,
                data: {
                  where: {
                    id: userMessage.id
                  },
                  data: {
                    disabled: isNFSW
                  }
                }
              }),
              messageImageRepository.updateMany({
                where: {
                  id: {
                    in: userMessage.images.map((image) => image.id)
                  }
                },
                data: {
                  is_nsfw: isNFSW
                }
              })
            ])

            throw new ForbiddenError({
              code: 'VIOLATION'
            })
          }
        }
        const isRussian = userMessageContent?.match(/[А-ЯЁа-яё]{2}/)

        if (isRussian && userMessageContent) {
          userMessageContent = await translatePrompt({ content: userMessageContent })
        }

        const caps = await modelService.getCaps({
          model,
          settings
        })
        await videoJob.start()

        chatService.eventStream.emit({
          chat,
          event: {
            name: 'MESSAGE_UPDATE',
            data: {
              message: {
                id: videoMessage.id,
                job_id: videoJob.id,
                job: videoJob.job
              }
            }
          }
        })

        const video = await sendVideoByProvider({
          providerId: null,
          model,
          message: userMessage,
          settings: videoSettings,
          user
        })

        let dek = null
        let videoContent = ''
        let isVideoContentEncrypted = false
        if (user.encryptedDEK && user.useEncryption && keyEncryptionKey) {
          dek = await cryptoGateway.decryptDEK({
            edek: user.encryptedDEK,
            kek: keyEncryptionKey
          })

          videoContent = await cryptoGateway.encrypt({
            dek,
            data: videoContent
          })
          isVideoContentEncrypted = true
        }
        const originalVideo = await fileService.write({
          buffer: video.buffer,
          ext: video.ext,
          dek
        })

        const videoFile = await videoRepository.create({
          data: {
            content: videoContent,
            duration_seconds: videoSettings.duration_seconds,
            isEncrypted: isVideoContentEncrypted,
            file: {
              create: {
                type: FileType.VIDEO,
                name: originalVideo.name,
                path: originalVideo.path,
                size: originalVideo.buffer.length,
                isEncrypted: originalVideo.isEncrypted
              }
            }
          }
        })

        await videoJob.done()

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

        videoMessage =
          (await messageStorage.update({
            user,
            keyEncryptionKey,
            data: {
              where: { id: videoMessage.id },
              data: {
                status: MessageStatus.DONE,
                transaction_id: transaction.id,
                video_id: videoFile.id
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
                video: {
                  include: {
                    file: true
                  }
                },
                buttons: true,
                all_buttons: {
                  distinct: ['action']
                },
                job: true
              }
            }
          })) ?? videoMessage

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
              message: videoMessage
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
          assistantMessage: videoMessage
        })
      } catch (error) {
        logger.error('SendReplicateVideo', error, {
          userId: user.id,
          email: user.email ?? user.tg_id,
          chatId: chat.id
        })
        await videoJob.setError(error)

        chatService.eventStream.emit({
          chat,
          event: {
            name: 'MESSAGE_UPDATE',
            data: {
              message: {
                id: videoMessage.id,
                job_id: videoJob.id,
                job: videoJob.job
              }
            }
          }
        })

        onEnd?.({
          userMessage,
          assistantMessage: videoMessage
        })

        throw error
      }
    }

    if (stream) {
      updateVideoMessage().catch(() => {})
    } else {
      await updateVideoMessage()
    }

    return videoMessage
  }
}
