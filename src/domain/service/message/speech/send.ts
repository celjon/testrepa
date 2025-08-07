import { FileType, MessageStatus, Platform } from '@prisma/client'
import { config } from '@/config'
import { getErrorString } from '@/lib'
import { logger } from '@/lib/logger'
import { Adapter } from '@/domain/types'
import { BanedUserError, NotFoundError } from '@/domain/errors'
import { IChat } from '@/domain/entity/chat'
import { IMessage } from '@/domain/entity/message'
import { ISubscription } from '@/domain/entity/subscription'
import { IUser } from '@/domain/entity/user'
import { IEmployee } from '@/domain/entity/employee'
import { ChatService } from '../../chat'
import { JobService } from '../../job'
import { SubscriptionService } from '../../subscription'
import { UserService } from '../../user'
import { ModelService } from '../../model'
import { MessageStorage } from '../storage/types'
import { FileService } from '../../file'

type Params = Adapter & {
  jobService: JobService
  chatService: ChatService
  subscriptionService: SubscriptionService
  userService: UserService
  modelService: ModelService
  messageStorage: MessageStorage
  fileService: FileService
}
export type SendSpeech = (params: {
  userMessage: IMessage
  chat: IChat
  user: IUser
  employee: IEmployee | null
  keyEncryptionKey: string | null
  subscription: ISubscription
  platform?: Platform
  sentPlatform?: Platform
  onEnd?: (params: { userMessage: IMessage; assistantMessage: IMessage | null }) => unknown
  stream: boolean
  developerKeyId?: string
}) => Promise<IMessage>

export const buildSendSpeech = ({
  messageStorage,
  mediaGateway,
  speechGateway,
  userService,
  chatService,
  modelService,
  modelRepository,
  chatRepository,
  subscriptionService,
  jobService,
  cryptoGateway,
  fileService,
  assemblyAiGateway,
}: Params): SendSpeech => {
  return async ({
    userMessage,
    chat,
    user,
    employee,
    keyEncryptionKey,
    subscription,
    platform,
    onEnd,
    stream,
    developerKeyId,
  }) => {
    const { settings } = chat
    if (!settings || !settings.speech) {
      throw new NotFoundError({
        code: 'SETTINGS_NOT_FOUND',
      })
    }

    const speechSettings = settings.speech
    settings.speech.response_format = 'wav'

    const model = await modelRepository.get({
      where: {
        id: settings.speech.model,
      },
    })

    if (!model) {
      throw new NotFoundError({
        code: 'MODEL_NOT_FOUND',
      })
    }

    let caps: number

    if (userMessage.content?.length) {
      caps = await modelService.getCaps.textToSpeech({
        model,
        params: {
          input: userMessage.content,
        },
      })
    } else {
      throw new BanedUserError({
        code: 'EMPTY_PROMPT',
        message: 'Prompt is too short',
        httpStatus: 400,
      })
    }

    //estimate
    await subscriptionService.checkBalance({ subscription, estimate: caps })

    const speechJob = await jobService.create({
      name: 'MODEL_GENERATION',
      chat,
    })

    let speechMessage = await messageStorage.create({
      user,
      keyEncryptionKey,
      data: {
        data: {
          role: 'assistant',
          status: MessageStatus.PENDING,
          chat_id: chat.id,
          user_id: user.id,
          model_id: model.id,
          job_id: speechJob.id,
          created_at: new Date(userMessage.created_at.getTime() + 1),
        },
        include: {
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
    })

    chatService.eventStream.emit({
      chat,
      event: {
        name: 'MESSAGE_CREATE',
        data: {
          message: speechMessage,
        },
      },
    })

    await speechJob.start()

    chatService.eventStream.emit({
      chat,
      event: {
        name: 'MESSAGE_UPDATE',
        data: {
          message: {
            id: speechMessage.id,
            job_id: speechJob.id,
            job: speechJob.job,
          },
        },
      },
    })

    const updateSpeechMessage = async () => {
      try {
        const { buffer } = await speechGateway.send({
          input: userMessage.content!,
          settings: speechSettings,
        })

        let dek = null
        if (user.encryptedDEK && user.useEncryption && keyEncryptionKey) {
          dek = await cryptoGateway.decryptDEK({
            edek: user.encryptedDEK as Buffer,
            kek: keyEncryptionKey,
          })
        }

        let messageContent = userMessage.content
        let isEncrypted = false
        if (dek) {
          messageContent = await cryptoGateway.encrypt({
            dek,
            data: userMessage.content!,
          })
          isEncrypted = true
        }

        const {
          name,
          path,
          url,
          isEncrypted: isEncryptedFile,
        } = await fileService.write({
          buffer: buffer,
          ext: '.wav',
          dek,
        })

        const { duration, waveData } = await mediaGateway.getData({
          assemblyAiGateway,
          file: { buffer: buffer, size: 0, originalname: 'audio.wav', mimetype: '' },
        })

        const { transaction, subscription: newSubscription } =
          await subscriptionService.writeOffWithLimitNotification({
            subscription,
            amount: caps,
            meta: {
              userId: user.id,
              enterpriseId: employee?.enterprise_id,
              platform,
              model_id: model.id,
              provider_id: config.model_providers.openai.id,
              developerKeyId,
            },
          })

        subscription = newSubscription

        speechMessage =
          (await messageStorage.update({
            user,
            keyEncryptionKey,
            data: {
              where: {
                id: speechMessage.id,
              },
              data: {
                voice: {
                  create: {
                    file: {
                      create: {
                        type: FileType.AUDIO,
                        name,
                        path,
                        url,
                        isEncrypted: isEncryptedFile,
                      },
                    },
                    content: messageContent!,
                    isEncrypted,
                    wave_data: waveData,
                    duration_seconds: duration,
                  },
                },
                transaction: {
                  connect: {
                    id: transaction.id,
                  },
                },
                buttons: {
                  create: {
                    action: 'DOWNLOAD',
                    type: 'BUTTON',
                    disabled: false,
                    message: {
                      connect: {
                        id: speechMessage.id,
                      },
                    },
                  },
                },
                status: MessageStatus.DONE,
                platform,
              },
              include: {
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
                transaction: true,
                voice: {
                  include: {
                    file: true,
                  },
                },
                buttons: true,
              },
            },
          })) ?? speechMessage

        chat =
          (await chatRepository.update({
            where: { id: chat.id },
            data: {
              total_caps: {
                increment: caps,
              },
            },
          })) ?? chat

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
              message: speechMessage,
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

        onEnd?.({
          userMessage,
          assistantMessage: speechMessage,
        })
      } catch (error) {
        await speechJob.setError(error)

        logger.error({
          location: 'sendSpeech',
          message: getErrorString(error),
          userId: user.id,
          email: user.email ?? user.tg_id,
          chatId: chat.id,
          modelId: model.id,
        })

        chatService.eventStream.emit({
          chat,
          event: {
            name: 'MESSAGE_UPDATE',
            data: {
              message: {
                id: speechMessage.id,
                job_id: speechJob.id,
                job: speechJob.job,
              },
            },
          },
        })

        onEnd?.({
          userMessage,
          assistantMessage: speechMessage,
        })

        throw error
      }
    }

    if (stream) {
      // Do not need to handle errors in stream mode
      updateSpeechMessage().catch(() => {})
    } else {
      await updateSpeechMessage()
    }

    return speechMessage
  }
}
