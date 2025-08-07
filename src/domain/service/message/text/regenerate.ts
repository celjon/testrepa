import { MessageStatus, Platform } from '@prisma/client'
import { getErrorString } from '@/lib'
import { logger } from '@/lib/logger'
import { Adapter } from '@/domain/types'
import { IChat } from '@/domain/entity/chat'
import { ChatService } from '../../chat'
import {
  BaseError,
  ForbiddenError,
  InternalError,
  InvalidDataError,
  NotFoundError,
} from '@/domain/errors'
import { ISubscription } from '@/domain/entity/subscription'
import { JobService } from '../../job'
import { IMessage } from '@/domain/entity/message'
import { IUser } from '@/domain/entity/user'
import { IEmployee } from '@/domain/entity/employee'
import { SubscriptionService } from '../../subscription'
import { UserService } from '../../user'
import { ModelService } from '../../model'
import { FileService } from '../../file'
import { SendTextByProvider } from './send-by-provider'
import { MessageStorage } from '../storage/types'
import { ConstantCostPlugin } from '../plugins/constant-cost'
import { buildOptimizeContext } from './optimize-context'
import { buildExtractGeneratedImages, extractGeneratedImageURLs } from './extract-generated-images'
import { isG4FProvider } from '@/domain/entity/model-provider'

type Params = Adapter & {
  constantCostPlugin: ConstantCostPlugin
  sendTextByProvider: SendTextByProvider
  chatService: ChatService
  jobService: JobService
  subscriptionService: SubscriptionService
  userService: UserService
  modelService: ModelService
  messageStorage: MessageStorage
  fileService: FileService
}

export type RegenerateText = (params: {
  userMessage?: IMessage | null
  oldMessage: IMessage
  subscription: ISubscription
  chat: IChat
  user: IUser
  employee: IEmployee | null
  keyEncryptionKey: string | null
  maxAllowedSetLength?: number
  platform?: Platform
  sentPlatform?: Platform
  locale: string
  developerKeyId?: string
}) => Promise<IMessage>

export const buildRegenerateText = ({
  constantCostPlugin,
  sendTextByProvider,
  messageStorage,
  chatService,
  subscriptionService,
  chatRepository,
  jobService,
  userService,
  modelRepository,
  modelService,
  messageSetRepository,
  imageGateway,
  messageImageRepository,
  cryptoGateway,
  fileService,
}: Params): RegenerateText => {
  const plugins = [
    {
      name: 'constant_cost',
      execute: constantCostPlugin,
    },
  ]

  const optimizeContext = buildOptimizeContext({ messageStorage, modelService })
  const extractGeneratedImages = buildExtractGeneratedImages({
    imageGateway,
    cryptoGateway,
    fileService,
    messageImageRepository,
  })

  return async ({
    userMessage,
    oldMessage,
    subscription,
    chat,
    user,
    employee,
    keyEncryptionKey,
    maxAllowedSetLength = 5,
    platform,
    sentPlatform,
    locale,
    developerKeyId,
  }) => {
    const { settings } = chat

    if (!settings || !settings.text) {
      throw new NotFoundError({
        code: 'SETTINGS_NOT_FOUND',
      })
    }

    const textSettings = settings.text ?? null

    const model =
      (await modelRepository.get({
        where: {
          id: textSettings.model,
        },
      })) ??
      chat.model ??
      null

    if (!model) {
      throw new NotFoundError({
        code: 'MODEL_NOT_FOUND',
      })
    }

    const textJob = await jobService.create({
      name: 'MODEL_GENERATION',
      chat,
    })

    if (settings.text.include_context && !userMessage) {
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
          user,
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

    if (set?.last) {
      oldMessage = set.last
    } else
      throw new NotFoundError({
        code: 'LAST_VERSION_NOT_FOUND',
        message: 'Last message version not found',
      })

    let textMessage = await messageStorage.create({
      user,
      keyEncryptionKey,
      data: {
        data: {
          role: 'assistant',
          status: MessageStatus.PENDING,
          chat_id: chat.id,
          user_id: user.id,
          version: oldMessage.version + 1,
          previous_version_id: oldMessage.id,
          choiced: true,
          model_id: textSettings.model,
          job_id: textJob.id,
          content: null,
          set_id: set!.id,
        },
      },
    })

    set = await messageSetRepository.update({
      where: {
        id: set?.id,
      },
      data: {
        choiced: textMessage.id,
        last: {
          connect: {
            id: textMessage.id,
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
                id: textMessage.id,
              },
            },
          },
        },
      })) ?? oldMessage

    textMessage =
      (await messageStorage.get({
        user,
        keyEncryptionKey,
        data: {
          where: {
            id: textMessage.id,
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
      })) ?? textMessage

    chatService.eventStream.emit({
      chat,
      event: {
        name: 'MESSAGE_RECREATE',
        data: {
          oldMessage,
          newMessage: textMessage,
        },
      },
    })
    ;(async () => {
      try {
        let prompt = userMessage?.full_content ?? userMessage?.content ?? ''
        let spentCaps = 0

        for (const { execute } of plugins) {
          const { promptAddition, systemPromptAddition, caps } = await execute({
            user,
            employee,
            keyEncryptionKey,
            chatId: chat.id,
            model,
            messages: [],
            settings,
            prompt,
            platform,
            sentPlatform,
            locale,
            subscription,
            job: textJob,
            assistantMessage: textMessage,
          })
          spentCaps += caps
          prompt += promptAddition
          textSettings.full_system_prompt = `${systemPromptAddition}${textSettings.full_system_prompt ?? textSettings.system_prompt ?? ''}`
        }

        const messages = await optimizeContext({
          user,
          keyEncryptionKey,
          model,
          settings,
          include_context: textSettings.include_context,
          userMessage: textMessage,
          chatId: chat.id,
        })

        const text$ = await sendTextByProvider({
          providerId: null,
          model,
          messages,
          settings: textSettings,
          user,
          textMessageId: textMessage.id,
          planType: subscription.plan?.type ?? null,
        })

        let content = ''
        let fullContent = ''
        let reasoningContent = ''
        const start = performance.now()
        let reasoningTimeMs: number | null = null
        const hasReasoning = model.features?.some((feature) => feature === 'CHAIN_OF_THOUGHT')

        await textJob.start({
          stop: async () => {
            text$.stream.controller.abort()

            // save current progress
            await messageStorage.update({
              user,
              keyEncryptionKey,
              data: {
                where: {
                  id: textMessage.id,
                },
                data: {
                  status: MessageStatus.DONE,
                  content,
                  reasoning_content: reasoningContent,
                  reasoning_time_ms: reasoningTimeMs,
                },
              },
            })
          },
        })

        chatService.eventStream.emit({
          chat,
          event: {
            name: 'MESSAGE_UPDATE',
            data: {
              message: {
                id: textMessage.id,
                job_id: textJob.id,
                job: textJob.job,
              },
            },
          },
        })

        await new Promise<void>((resolve, reject) => {
          text$.subscribe({
            next: async ({ status, value, reasoningValue, usage, provider, g4f_account_id }) => {
              try {
                if (status === 'pending') {
                  if (provider && isG4FProvider(provider)) {
                    const imageURLs = extractGeneratedImageURLs(value)
                    if (imageURLs.length === 0) {
                      content += value
                    }
                  } else {
                    content += value
                  }
                  fullContent += value
                  reasoningContent += reasoningValue ?? ''

                  if (
                    hasReasoning &&
                    reasoningValue === null &&
                    content.length > 0 &&
                    reasoningTimeMs === null
                  ) {
                    reasoningTimeMs = performance.now() - start
                  }

                  chatService.eventStream.emit({
                    chat,
                    event: {
                      name: 'MESSAGE_UPDATE',
                      data: {
                        message: {
                          id: textMessage.id,
                          content,
                          reasoning_content: reasoningContent,
                          reasoning_time_ms: reasoningTimeMs,
                        },
                      },
                    },
                  })
                }

                if (status === 'done' && usage !== null) {
                  await textJob.done()

                  await extractGeneratedImages({
                    user,
                    keyEncryptionKey,
                    messageId: textMessage.id,
                    content: value,
                  })

                  const caps = await modelService.getCaps.text({
                    model,
                    usage,
                  })
                  spentCaps += caps

                  const writeOffResult = await subscriptionService.writeOffWithLimitNotification({
                    subscription,
                    amount: spentCaps,
                    meta: {
                      userId: user.id,
                      enterpriseId: employee?.enterprise_id,
                      platform,
                      model_id: model.id,
                      provider_id: provider?.id ?? undefined,
                      g4f_account_id,
                      developerKeyId,
                    },
                  })
                  const { transaction } = writeOffResult

                  subscription = writeOffResult.subscription

                  chat =
                    (await chatRepository.update({
                      where: {
                        id: chat.id,
                      },
                      data: {
                        total_caps: {
                          increment: spentCaps,
                        },
                      },
                    })) ?? chat

                  textMessage =
                    (await messageStorage.update({
                      user,
                      keyEncryptionKey,
                      data: {
                        where: {
                          id: textMessage.id,
                        },
                        data: {
                          status: MessageStatus.DONE,
                          tokens: usage.total_tokens,
                          transaction_id: transaction.id,
                          content,
                          full_content: fullContent,
                          reasoning_content: reasoningContent,
                          reasoning_time_ms: reasoningTimeMs,
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
                          job: true,
                        },
                      },
                    })) ?? textMessage

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
                        message: textMessage,
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

                  resolve()
                }
              } catch (e) {
                reject(e)
              }
            },
            error: reject,
          })
        })
      } catch (error) {
        let err = error
        if (
          !(err instanceof BaseError) ||
          err instanceof InternalError ||
          err.code?.startsWith('G4F_')
        ) {
          err = new InternalError({
            code: 'INTERNAL_ERROR',
          })
          logger.error({
            location: 'regenerateText',
            message: getErrorString(error),
            userId: user.id,
            email: user.email ?? user.tg_id,
            chatId: chat.id,
            messageId: textMessage.id,
            modelId: model.id,
          })
        }
        const errorJob = await textJob.setError(err)

        chatService.eventStream.emit({
          chat,
          event: {
            name: 'MESSAGE_UPDATE',
            data: {
              message: {
                id: textMessage.id,
                job_id: errorJob.id,
                job: errorJob,
                content: null,
              },
            },
          },
        })
      }
    })()

    return textMessage
  }
}
