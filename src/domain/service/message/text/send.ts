import { MessageStatus, Platform } from '@prisma/client'
import { getErrorString } from '@/lib'
import { logger } from '@/lib/logger'
import { Adapter } from '@/domain/types'
import { IChat } from '@/domain/entity/chat'
import { ChatService } from '../../chat'
import { BaseError, InternalError, NotFoundError } from '@/domain/errors'
import { ISubscription } from '@/domain/entity/subscription'
import { IMessage } from '@/domain/entity/message'
import { IUser } from '@/domain/entity/user'
import { isG4FProvider } from '@/domain/entity/modelProvider'
import { SubscriptionService } from '../../subscription'
import { JobService } from '../../job'
import { UserService } from '../../user'
import { ModelService } from '../../model'
import { SendTextByProvider } from './sendByProvider'
import { UploadFiles } from '../upload/files'
import { RawFile } from '@/domain/entity/file'
import { UploadVoice } from '../upload/voice'
import { GeneratePrompt } from '../generatePrompt'
import { MessageStorage } from '../storage/types'
import { PerformWebSearch } from '../plugins/web-search/performWebSearch'
import { UploadVideo } from '../upload/video'
import { GeneralSystemPromptPlugin } from '../plugins/general-system-prompt'
import { ConstantCostPlugin } from '../plugins/constant-cost'
import { IEmployee } from '@/domain/entity/employee'
import { buildOptimizeContext } from './optimize-context'
import { FileService } from '../../file'
import { buildExtractGeneratedImages, extractGeneratedImageURLs } from './extract-generated-images'

type Params = Adapter & {
  sendTextByProvider: SendTextByProvider
  generatePrompt: GeneratePrompt
  uploadFiles: UploadFiles
  uploadVoice: UploadVoice
  uploadVideo: UploadVideo
  constantCostPlugin: ConstantCostPlugin
  performWebSearchPlugin: PerformWebSearch
  generalSystemPromptPlugin: GeneralSystemPromptPlugin
  chatService: ChatService
  jobService: JobService
  subscriptionService: SubscriptionService
  userService: UserService
  modelService: ModelService
  messageStorage: MessageStorage
  fileService: FileService
}

export type SendText = (params: {
  subscription: ISubscription
  chat: IChat
  user: IUser
  employee: IEmployee | null
  keyEncryptionKey: string | null
  userMessage: IMessage
  files: RawFile[]
  voiceFile?: RawFile | null
  videoFile?: RawFile | null
  platform?: Platform
  sentPlatform?: Platform
  locale: string
  onEnd?: (params: { userMessage: IMessage; assistantMessage: IMessage | null }) => unknown
  stream: boolean
}) => Promise<IMessage>

export const buildSendText = ({
  sendTextByProvider,
  generatePrompt,
  uploadFiles,
  uploadVoice,
  uploadVideo,
  constantCostPlugin,
  performWebSearchPlugin: performWebSearch,
  generalSystemPromptPlugin,
  messageStorage,
  chatService,
  subscriptionService,
  chatRepository,
  jobService,
  userService,
  modelRepository,
  modelService,
  cryptoGateway,
  imageGateway,
  messageImageRepository,
  fileService
}: Params): SendText => {
  const plugins = [
    {
      name: 'constant_cost',
      execute: constantCostPlugin
    },
    {
      name: 'general_system_prompt',
      execute: generalSystemPromptPlugin
    },
    {
      name: 'web_search',
      execute: performWebSearch
    }
  ] as const

  const optimizeContext = buildOptimizeContext({ messageStorage, modelService })
  const extractGeneratedImages = buildExtractGeneratedImages({
    imageGateway,
    cryptoGateway,
    fileService,
    messageImageRepository
  })

  return async ({
    subscription,
    chat,
    user,
    employee,
    keyEncryptionKey,
    userMessage,
    files,
    voiceFile,
    videoFile,
    locale,
    platform,
    sentPlatform,
    onEnd,
    stream
  }) => {
    if (!chat.model) {
      throw new InternalError({
        code: 'PARENT_MODEL_NOT_FOUND'
      })
    }

    const { settings } = chat

    if (!settings || !settings.text) {
      throw new NotFoundError({
        code: 'SETTINGS_NOT_FOUND'
      })
    }

    const textSettings = settings.text ?? null
    const model =
      (await modelRepository.get({
        where: {
          id: textSettings.model
        }
      })) ??
      chat.model ??
      null

    if (!model) {
      throw new NotFoundError({
        code: 'CHILD_MODEL_NOT_FOUND'
      })
    }

    const textJob = await jobService.create({
      name: 'MODEL_GENERATION',
      chat
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
          model_id: textSettings.model,
          job_id: textJob.id,
          content: null
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
          message: textMessage
        }
      }
    })

    const updateTextMessage = async () => {
      try {
        const [{ userMessageImages, userMessageAttachmentsFiles }, { userMessageVoice }, { userMessageVideo }] = await Promise.all([
          uploadFiles({ files, user, keyEncryptionKey }),
          uploadVoice({ voiceFile, user, keyEncryptionKey }),
          uploadVideo({ videoFile, user, keyEncryptionKey })
        ])

        let dek = null
        if (user.encryptedDEK && user.useEncryption && keyEncryptionKey) {
          dek = await cryptoGateway.decryptDEK({
            edek: user.encryptedDEK,
            kek: keyEncryptionKey
          })
        }

        let { prompt, caps: promptCaps } = await generatePrompt({
          content: userMessage.content,
          voice: userMessageVoice,
          video: userMessageVideo,
          files: userMessageAttachmentsFiles,
          analyzeURLs: textSettings.analyze_urls,
          dek
        })

        let spentCaps = promptCaps
        let webSearchCaps = 0

        for (const { name, execute } of plugins) {
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
            assistantMessage: textMessage
          })
          spentCaps += caps
          if (name === 'web_search') {
            webSearchCaps = caps
          }
          prompt += promptAddition
          if (systemPromptAddition) {
            textSettings.full_system_prompt = `${systemPromptAddition}\n\n${textSettings.full_system_prompt ?? textSettings.system_prompt ?? ''}`
          }
        }

        userMessage =
          (await messageStorage.update({
            user,
            keyEncryptionKey,
            data: {
              where: {
                id: userMessage.id
              },
              data: {
                full_content: prompt,
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
                ...(userMessageVideo && {
                  video_id: userMessageVideo.id
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
                },
                video: {
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

        const messages = await optimizeContext({
          user,
          keyEncryptionKey,
          model,
          settings,
          include_context: textSettings.include_context,
          userMessage,
          chatId: chat.id
        })

        const text$ = await sendTextByProvider({
          providerId: null,
          model,
          messages,
          settings: textSettings,
          user,
          textMessageId: textMessage.id,
          planType: subscription.plan?.type ?? null
        })
        const { stream } = text$

        let content = ''
        let fullContent = ''
        let reasoningContent = ''
        const start = performance.now()
        let reasoningTimeMs: number | null = null
        const hasReasoning = model.features?.some((feature) => feature === 'CHAIN_OF_THOUGHT')

        await textJob.start({
          stop: async () => {
            if (stream) {
              stream.controller.abort()

              // save current progress
              const stoppedMessage =
                (await messageStorage.update({
                  user,
                  keyEncryptionKey,
                  data: {
                    where: {
                      id: textMessage.id
                    },
                    data: {
                      status: MessageStatus.DONE,
                      content,
                      reasoning_content: reasoningContent,
                      reasoning_time_ms: reasoningTimeMs
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
                      job: true
                    }
                  }
                })) ?? textMessage

              chatService.eventStream.emit({
                chat,
                event: {
                  name: 'MESSAGE_UPDATE',
                  data: {
                    message: stoppedMessage
                  }
                }
              })
            }
          }
        })

        chatService.eventStream.emit({
          chat,
          event: {
            name: 'MESSAGE_UPDATE',
            data: {
              message: {
                id: textMessage.id,
                job_id: textJob.id,
                job: textJob.job
              }
            }
          }
        })

        await new Promise<void>((resolve, reject) => {
          text$.subscribe({
            next: async ({ status, value, reasoningValue, usage, provider }) => {
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

                  if (hasReasoning && reasoningValue === null && content.length > 0 && reasoningTimeMs === null) {
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
                          reasoning_time_ms: reasoningTimeMs
                        }
                      }
                    }
                  })
                }

                if (status === 'done' && usage !== null) {
                  await textJob.done()

                  await extractGeneratedImages({
                    user,
                    keyEncryptionKey,
                    messageId: textMessage.id,
                    content: value
                  })

                  const caps = await modelService.getCaps({
                    model,
                    usage
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
                      expense_details: {
                        web_search: webSearchCaps
                      }
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
                          increment: spentCaps
                        }
                      }
                    })) ?? chat

                  textMessage =
                    (await messageStorage.update({
                      user,
                      keyEncryptionKey,
                      data: {
                        where: {
                          id: textMessage.id
                        },
                        data: {
                          status: MessageStatus.DONE,
                          tokens: usage.total_tokens,
                          transaction_id: transaction.id,
                          content,
                          full_content: fullContent,
                          reasoning_content: reasoningContent,
                          reasoning_time_ms: reasoningTimeMs
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
                    })) ?? textMessage

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
                        message: textMessage
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
                    assistantMessage: textMessage
                  })

                  resolve()
                }
              } catch (e) {
                reject(e)
              }
            },
            error: reject
          })
        })
      } catch (error) {
        let err = error
        if (!(err instanceof BaseError) || err instanceof InternalError || err.code?.startsWith('G4F_')) {
          err = new InternalError({
            code: 'INTERNAL_ERROR'
          })
          logger.error({
            location: 'sendText',
            message: getErrorString(error),
            userId: user.id,
            email: user.email ?? user.tg_id,
            chatId: chat.id,
            messageId: textMessage.id
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
                content: null
              }
            }
          }
        })

        onEnd?.({
          userMessage,
          assistantMessage: textMessage
        })

        throw err
      }
    }

    if (stream) {
      // Do not need to handle errors in stream mode
      updateTextMessage().catch(() => {})
    } else {
      await updateTextMessage()
    }

    return textMessage
  }
}
