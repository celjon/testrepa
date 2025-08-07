import { AxiosError } from 'axios'
import { FileType, MessageStatus, Platform } from '@prisma/client'
import { getErrorString } from '@/lib'
import { logger } from '@/lib/logger'
import { config } from '@/config'
import {
  BaseError,
  ForbiddenError,
  InvalidDataError,
  NotFoundError,
  TooManyRequestsError,
} from '@/domain/errors'
import { Adapter } from '@/domain/types'
import { IChat } from '@/domain/entity/chat'
import { IMessage } from '@/domain/entity/message'
import { getFileURL, RawFile } from '@/domain/entity/file'
import { IUser } from '@/domain/entity/user'
import { IEmployee } from '@/domain/entity/employee'
import { ISubscription } from '@/domain/entity/subscription'
import { ChatService } from '@/domain/service/chat'
import { JobService } from '@/domain/service/job'
import { MidjourneyService } from '../../midjourney'
import { ModerationService } from '../../moderation'
import { UploadVoice } from '../upload/voice'
import { UploadFiles } from '../upload/files'
import { UserService } from '../../user'
import { SubscriptionService } from '../../subscription'
import { ModelService } from '../../model'
import { DefineButtonsAndImages } from './define-buttons'
import { Callback } from './callback'
import { MessageStorage } from '../storage/types'
import { TransalatePrompt } from '../translate-prompt'
import { ProcessMj, ProcessMjParams, MjConfig } from './process-mj'

type Params = Adapter & {
  defineButtonsAndImages: DefineButtonsAndImages
  callback: Callback
  uploadFiles: UploadFiles
  uploadVoice: UploadVoice
  translatePrompt: TransalatePrompt
  chatService: ChatService
  subscriptionService: SubscriptionService
  modelService: ModelService
  userService: UserService
  jobService: JobService
  midjourneyService: MidjourneyService
  moderationService: ModerationService
  messageStorage: MessageStorage
  processMj: ProcessMj
}

export type SendMidjourney = (params: {
  userMessage: IMessage
  subscription: ISubscription
  chat: IChat
  user: IUser
  employee: IEmployee | null
  keyEncryptionKey: string | null
  files: RawFile[]
  voiceFile?: RawFile | null
  platform?: Platform
  sentPlatform?: Platform
  onEnd?: (params: { userMessage: IMessage; assistantMessage: IMessage | null }) => unknown
  stream: boolean
  developerKeyId?: string
}) => Promise<IMessage>

export const buildSendMidjourney = ({
  defineButtonsAndImages,
  callback,
  uploadFiles,
  uploadVoice,
  translatePrompt,
  processMj,
  messageRepository,
  messageStorage,
  jobService,
  chatService,
  messageImageRepository,
  moderationService,
  userService,
  fileRepository,
  chatRepository,
  modelService,
  subscriptionService,
  midjourneyService,
}: Params): SendMidjourney => {
  return async ({
    userMessage,
    subscription,
    chat,
    user,
    employee,
    keyEncryptionKey,
    files: rawFiles,
    voiceFile,
    platform,
    onEnd,
    stream,
    developerKeyId,
  }) => {
    if (!chat.model_function || !chat.settings || !chat.settings.mj) {
      throw new NotFoundError({
        code: 'SETTINGS_NOT_FOUND',
      })
    }
    const mjJob = await jobService.create({
      name: 'MODEL_GENERATION',
      timeout: 1_200_000,
      chat,
      user_message_id: userMessage.id,
      mj_native_message_id: null,
    })
    const mjSettings = chat.settings.mj
    const mjFunction = chat.model_function
    const mjModel = mjJob.chat.model
    let mjNo = mjSettings.no

    let mjMessage = await messageRepository.create({
      data: {
        role: 'assistant',
        status: MessageStatus.PENDING,
        chat_id: chat.id,
        user_id: user.id,
        model_id: chat.model_id,
        model_version: chat.settings.mj.version,
        ...(mjFunction.name === 'imagine' && {
          mj_mode: mjSettings.mode,
        }),
        job_id: mjJob.id,
        request_id: userMessage.id,
        created_at: new Date(userMessage.created_at.getTime() + 1),
      },
      include: {
        model: {
          include: {
            icon: true,
          },
        },
        job: true,
      },
    })

    chatService.eventStream.emit({
      chat,
      event: {
        name: 'MESSAGE_CREATE',
        data: {
          message: mjMessage,
        },
      },
    })

    onEnd?.({
      userMessage,
      assistantMessage: null,
    })
    const updateMjMessage = async () => {
      try {
        const [{ userMessageImages, userMessageAttachmentsFiles }, { userMessageVoice }] =
          await Promise.all([
            uploadFiles({ files: rawFiles, user, keyEncryptionKey }),
            uploadVoice({ voiceFile, user, keyEncryptionKey }),
          ])

        userMessage =
          (await messageStorage.update({
            user,
            keyEncryptionKey,
            data: {
              where: {
                id: userMessage.id,
              },
              data: {
                images: {
                  connect: userMessageImages.map(({ id }) => ({ id })),
                },
                attachments: {
                  createMany: {
                    data: userMessageAttachmentsFiles.map((userMessageAttachmentFile) => ({
                      file_id: userMessageAttachmentFile.id,
                    })),
                  },
                },
                ...(userMessageVoice && {
                  voice_id: userMessageVoice.id,
                }),
                platform,
              },
              include: {
                user: true,
                images: {
                  include: {
                    original: true,
                    preview: true,
                    buttons: true,
                  },
                },
                attachments: {
                  include: {
                    file: true,
                  },
                },
                voice: {
                  include: {
                    file: true,
                  },
                },
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

        await midjourneyService.moderate({
          userId: user.id,
          messageId: userMessage.id,
          content: userMessage.content ?? '',
        })

        if (userMessage.images) {
          const { flagged: isNSFW } = await moderationService.visionModerate({
            imagePaths: userMessage.images
              .map((image) => image.original?.path)
              .filter((url) => !!url) as string[],
            userId: user.id,
          })

          if (isNSFW) {
            await Promise.all([
              messageStorage.update({
                user,
                keyEncryptionKey,
                data: {
                  where: {
                    id: userMessage.id,
                  },
                  data: {
                    disabled: isNSFW,
                  },
                },
              }),
              messageImageRepository.updateMany({
                where: {
                  id: {
                    in: userMessage.images.map((image) => image.id),
                  },
                },
                data: {
                  is_nsfw: isNSFW,
                },
              }),
            ])

            throw new ForbiddenError({
              code: 'VIOLATION',
            })
          }
        }

        const floodTimeout = config.timeouts.midjourney_timeout_between_requests
        const lastMidjourneyMessagesFromUser = await messageStorage.get({
          user,
          keyEncryptionKey,
          data: {
            where: {
              user_id: user.id,
              model_id: 'midjourney',
              status: MessageStatus.PENDING,
            },
            skip: 1,
            select: {
              created_at: true,
            },
            orderBy: {
              created_at: 'desc',
            },
          },
        })

        const timeAfterLastMessage =
          lastMidjourneyMessagesFromUser &&
          new Date().getTime() - new Date(lastMidjourneyMessagesFromUser.created_at).getTime()

        if (timeAfterLastMessage && timeAfterLastMessage < floodTimeout) {
          await messageStorage.update({
            user,
            keyEncryptionKey,
            data: {
              where: {
                id: mjMessage.id,
              },
              data: {
                disabled: true,
                status: MessageStatus.DONE,
              },
            },
          })

          const remainingTimeout = (floodTimeout - timeAfterLastMessage) / 1000

          throw new TooManyRequestsError({
            code: 'FLOOD_ERROR',
            message: `You have sent too many requests recently. Please try again in ${remainingTimeout} seconds`,
            data: {
              remainingTimeout,
            },
          })
        }

        let userMessageContent = userMessage.content

        if (userMessageContent?.match(/[А-ЯЁа-яё]{2}/)) {
          userMessageContent = await translatePrompt({ content: userMessageContent })
        }

        if (mjNo?.match(/[А-ЯЁа-яё]{2}/)) {
          mjNo = await translatePrompt({ content: mjNo })
        }

        //estimate
        await subscriptionService.checkBalance({
          subscription,
          estimate: await modelService.estimate.image({ mj: { model: mjModel!, mjSettings } }),
        })

        await mjJob.start()

        chatService.eventStream.emit({
          chat,
          event: {
            name: 'MESSAGE_UPDATE',
            data: {
              message: {
                id: mjMessage.id,
                job_id: mjJob.id,
                job: mjJob.job,
              },
            },
          },
        })

        const account = await modelService.accountBalancer.midjourney.findAvailableAccount()

        if (!account.mj_channel_id || !account.mj_server_id || !account.mj_token)
          throw new NotFoundError({
            code: 'MIDJOURNEY_QUEUES_NOT_FOUND',
          })

        const mjConfig: MjConfig = {
          accountId: account.id,
          ChannelId: account.mj_channel_id,
          SalaiToken: account.mj_token,
          ServerId: account.mj_server_id,
          PersonalizationKey: account.mj_personalization_key ?? undefined,
        }

        if (mjFunction.name === 'imagine') {
          const imagineParams: ProcessMjParams = {
            modelFunction: mjFunction.name,
            message: {
              ...userMessage,
              content: userMessageContent || (userMessageVoice?.content ?? null),
            },
            settings: {
              ...mjSettings,
              no: mjNo,
            },
            callback: callback({ mjJob, chat, messageId: mjMessage.id }),
          }
          const imagineResult = await processMj({ account, mjConfig, imagineParams })

          if (!imagineResult) return mjJob

          const { id: nativeMessageId } = imagineResult

          const { messageButtons, messageImages } = await defineButtonsAndImages({
            generationResult: imagineResult,
            messageId: mjMessage.id,
          })

          const files = await fileRepository.createMany(
            messageImages.map((messageImage) => ({
              data: {
                type: FileType.IMAGE,
                path: messageImage.original?.path,
              },
            })),
          )

          const messageImageUrls: string[] = []

          for (const messageImage of messageImages) {
            if (!messageImage.original || !messageImage.original.url) {
              continue
            }

            messageImageUrls.push(messageImage.original.url)
          }

          mjMessage =
            (await messageRepository.update({
              where: {
                id: mjMessage.id,
              },
              data: {
                status: MessageStatus.DONE,
                additional_content: {
                  imageUrls: messageImageUrls,
                },
                images: {
                  connect: messageImages.map(({ id }) => ({ id })),
                },
                buttons: {
                  connect: messageButtons.map(({ id }) => ({ id })),
                },
                attachments: {
                  createMany: {
                    data: files.map((file) => ({
                      file_id: file.id,
                    })),
                  },
                },
              },
            })) ?? mjMessage

          await mjJob.update({
            mj_native_message_id: nativeMessageId,
          })
          await mjJob.done()
        } else if (mjFunction.name === 'describe') {
          if (userMessageImages.length === 0) {
            throw new InvalidDataError({
              code: 'MESSAGE_IMAGE_NOT_FOUND',
            })
          }

          let image = userMessageImages[0]

          if (!image.original)
            image =
              (await messageImageRepository.get({
                where: { id: image.id },
                include: { original: true },
              })) ?? image

          const url = getFileURL(image.original!).href

          const describeResult = await processMj({
            imagineParams: {
              modelFunction: mjFunction.name,
              message: { ...userMessage, content: userMessageContent },
            },
            account,
            mjConfig,
            url,
          })

          if (!describeResult) return mjJob

          mjMessage =
            (await messageRepository.update({
              where: {
                id: mjMessage.id,
              },
              data: {
                status: MessageStatus.DONE,
                content: describeResult.content,
              },
            })) ?? mjMessage
          await mjJob.update({
            mj_native_message_id: describeResult.id,
          })
          await mjJob.done()
        }

        const caps = await modelService.getCaps.image({
          model: mjModel!,
          message: mjMessage,
        })

        const writeOffResult = await subscriptionService.writeOffWithLimitNotification({
          subscription,
          amount: caps,
          meta: {
            userId: user.id,
            enterpriseId: employee?.enterprise_id,
            platform,
            model_id: mjModel!.id,
            provider_id: config.model_providers.midjourney.id,
            developerKeyId,
          },
        })
        const { transaction, subscription: updatedSubscription } = writeOffResult

        mjMessage = await messageRepository.update({
          where: {
            id: mjMessage.id,
          },
          data: {
            transaction_id: transaction.id,
          },
          include: {
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
            buttons: {
              where: {
                disabled: false,
              },
            },
            all_buttons: {
              distinct: ['action'],
            },
            job: true,
            attachments: {
              include: {
                file: true,
              },
            },
          },
        })

        chat =
          (await chatRepository.update({
            where: {
              id: chat.id,
            },
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
              message: mjMessage!,
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
                id: updatedSubscription.id,
                balance: updatedSubscription.balance,
              },
            },
          },
        })
      } catch (error) {
        await mjJob.setError(error)

        if (error instanceof AxiosError) {
          logger.error({
            location: 'sendMidjourney',
            message: getErrorString(error),
          })

          if (
            error.response?.status === 403 ||
            error.response?.data.message ===
              'Your do not have enough credits, try upgrade your plan or pay one time to get more.'
          ) {
            throw new BaseError({
              httpStatus: 403,
              message: 'Midjourney servers are currently overloaded. Please try again later.',
              code: 'MIDJOURNEY_ERROR',
            })
          } else {
            throw new BaseError({
              httpStatus: error.response?.status,
              message: error.response?.data?.message,
              code: 'MIDJOURNEY_ERROR',
            })
          }
        } else {
          logger.error({
            location: 'sendMidjourney',
            message: getErrorString(error),
          })
        }

        chatService.eventStream.emit({
          chat,
          event: {
            name: 'MESSAGE_UPDATE',
            data: {
              message: {
                id: mjMessage.id,
                job_id: mjJob.id,
                job: mjJob.job,
              },
            },
          },
        })

        throw error
      }
    }

    if (stream) {
      // Do not need to handle errors in stream mode
      updateMjMessage().catch(() => {})
    } else {
      await updateMjMessage()
    }

    return mjMessage
  }
}
