import { extname } from 'path'
import { Readable } from 'stream'
import * as mm from 'music-metadata'
import { config } from '@/config'
import { getErrorString } from '@/lib'
import { logger } from '@/lib/logger'
import { Adapter } from '@/domain/types'
import { IChat } from '@/domain/entity/chat'
import { IMessage } from '@/domain/entity/message'
import { ISubscription } from '@/domain/entity/subscription'
import { IUser } from '@/domain/entity/user'
import { MessageStatus, Platform } from '@prisma/client'
import { ChatService } from '../../chat'
import { JobService } from '../../job'
import { SubscriptionService } from '../../subscription'
import { UserService } from '../../user'
import { ForbiddenError, NotFoundError } from '@/domain/errors'
import { determinePlatform } from '@/domain/entity/action'
import { ModelService } from '../../model'
import { MessageStorage } from '../storage/types'
import { FileService } from '../../file'
import { RawFile } from '@/domain/entity/file'
import { Speech2TextService } from '../../speech2text'
import { ConstantCostPlugin } from '../plugins/constant-cost'

type Params = Adapter & {
  jobService: JobService
  chatService: ChatService
  subscriptionService: SubscriptionService
  userService: UserService
  modelService: ModelService
  messageStorage: MessageStorage
  fileService: FileService
  speech2TextService: Speech2TextService
  constantCostPlugin: ConstantCostPlugin
}

export type SendSpeech2Text = (params: {
  userMessage: IMessage
  chat: IChat
  user: IUser
  voiceFile: RawFile | null
  videoFile: RawFile | null
  keyEncryptionKey: string | null
  subscription: ISubscription
  platform?: Platform
  sentPlatform?: Platform
  onEnd?: (params: { userMessage: IMessage; assistantMessage: IMessage | null }) => unknown
  developerKeyId?: string
}) => Promise<IMessage>

const isAcceptableFormat = (filename?: string) =>
  filename
    ? ['flac', 'mp3', 'mp4', 'mpeg', 'mpga', 'm4a', 'ogg', 'wav', 'webm'].includes(
        extname(filename).split('.')[1],
      )
    : true

export const buildSendSpeech2Text = ({
  messageStorage,
  userService,
  chatService,
  speech2TextService,
  modelRepository,
  chatRepository,
  subscriptionService,
  jobService,
  modelService,
  employeeRepository,
  constantCostPlugin,
}: Params): SendSpeech2Text => {
  return async ({
    subscription,
    chat,
    user,
    keyEncryptionKey,
    userMessage,
    voiceFile,
    videoFile,
    platform,
    onEnd,
    sentPlatform,
    developerKeyId,
  }) => {
    const { settings } = chat

    if (!settings || !settings.stt || !settings.stt.model) {
      throw new NotFoundError({
        code: 'SETTINGS_NOT_FOUND',
      })
    }

    const model = await modelRepository.get({
      where: {
        id: settings.stt.model,
      },
    })

    if (!chat.model || !model) {
      throw new NotFoundError({
        code: 'MODEL_NOT_FOUND',
      })
    }

    if (!voiceFile && !videoFile) {
      throw new NotFoundError({
        code: 'MEDIA_FILE_REQUIRED',
      })
    }

    if (voiceFile && videoFile) {
      throw new ForbiddenError({
        code: 'ATTACH_ONLY_ONE_FILE',
      })
    }

    if (
      !isAcceptableFormat(voiceFile?.originalname) ||
      !isAcceptableFormat(videoFile?.originalname)
    ) {
      throw new ForbiddenError({
        code: 'MEDIA_FILE_IS_NOT_ACCEPTABLE',
        message:
          'Media file processing is only available in one of the following formats: flac, mp3, mp4, mpeg, mpga, m4a, ogg, wav or webm',
      })
    }

    const employee = await employeeRepository.get({
      where: {
        user_id: userMessage.id,
      },
    })

    platform = determinePlatform(platform, !!employee?.enterprise_id)

    const sttJob = await jobService.create({
      name: 'MODEL_GENERATION',
      chat,
    })

    const { caps: pluginCaps } = await constantCostPlugin({
      employee,
      subscription,
      settings,
      sentPlatform: sentPlatform,
      platform,
      chatId: chat.id,
      job: sttJob,
      messages: [],
      model,
      prompt: '',
      user: user,
      keyEncryptionKey,
    })

    const mediaFileReadable = new Readable()
    const mediaFile = videoFile ?? voiceFile
    mediaFileReadable.push(mediaFile!.buffer)
    mediaFileReadable.push(null)
    const { format } = await mm
      .parseStream(mediaFileReadable, {}, { duration: true })
      .catch((error) => {
        logger.error({
          location: 'sendSpeech2Text',
          message: `Unable to get duration for file ${mediaFile?.originalname}. Error: ${getErrorString(error)}`,
          userId: user.id,
          email: user.email ?? user.tg_id,
          chatId: chat.id,
          modelId: model.id,
        })

        return {
          format: {
            duration: undefined,
          },
        }
      })

    if (format.duration !== undefined) {
      await subscriptionService.checkBalance({
        subscription,
        estimate:
          pluginCaps +
          (await modelService.getCaps.speechToText({
            model,
            audioMetadata: {
              duration: format.duration,
            },
          })),
      })
    }

    let sttMessage = await messageStorage.create({
      user,
      keyEncryptionKey,
      data: {
        data: {
          role: 'assistant',
          status: MessageStatus.PENDING,
          chat_id: chat.id,
          user_id: user.id,
          model_id: settings.stt.model,
          job_id: sttJob.id,
          content: null,
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
          message: sttMessage,
        },
      },
    })

    await sttJob.start()
    ;(async () => {
      try {
        userMessage =
          (await messageStorage.update({
            user,
            keyEncryptionKey,
            data: {
              where: {
                id: userMessage.id,
              },
              data: {
                content: mediaFile?.originalname,
              },
              include: {
                user: true,
              },
            },
          })) ?? userMessage

        chatService.eventStream.emit({
          chat,
          event: {
            name: 'MESSAGE_UPDATE',
            data: {
              message: userMessage,
            },
          },
        })

        const { result, duration } = await speech2TextService.transcribe({
          config: {
            model_id: model.id,
            temperature: settings.stt?.temperature,
            format_text: settings.stt?.format,
            speaker_labels: settings.stt?.speakers,
            prompt: userMessage.content ?? undefined,
            mediaFile,
          },
        })

        let caps =
          pluginCaps +
          (await modelService.getCaps.speechToText({
            model,
            audioMetadata: {
              duration,
            },
          }))

        const { transaction, subscription: newSubscription } =
          await subscriptionService.writeOffWithLimitNotification({
            subscription,
            amount: caps,
            meta: {
              userId: user.id,
              enterpriseId: employee?.enterprise_id,
              platform,
              model_id: model?.id,
              provider_id: model.id.match(/^whisper/)
                ? config.model_providers.openai.id
                : config.model_providers.assemblyAI.id,
              developerKeyId,
            },
          })

        subscription = newSubscription

        await sttJob.done()

        sttMessage =
          (await messageStorage.update({
            user,
            keyEncryptionKey,
            data: {
              where: {
                id: sttMessage.id,
              },
              data: {
                status: MessageStatus.DONE,
                transaction_id: transaction.id,
                content: result,
              },
              include: {
                user: true,
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
                job: true,
              },
            },
          })) ?? sttMessage

        userMessage =
          (await messageStorage.update({
            user,
            keyEncryptionKey,
            data: {
              where: {
                id: userMessage.id,
              },
              data: {
                full_content: result,
              },
            },
          })) ?? userMessage

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
              message: sttMessage,
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
          assistantMessage: sttMessage,
        })
      } catch (error) {
        const errorJob = await sttJob.setError(error)

        logger.error({
          location: 'sendSpeech2Text',
          message: ` ${getErrorString(error)}`,
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
                id: sttMessage.id,
                job_id: errorJob.id,
                job: errorJob,
              },
            },
          },
        })

        onEnd?.({
          userMessage,
          assistantMessage: sttMessage,
        })
      }
    })()

    return sttMessage
  }
}
