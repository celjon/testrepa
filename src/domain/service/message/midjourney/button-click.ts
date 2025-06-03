import { Adapter } from '@/domain/types'
import { ChatService } from '../../chat'
import { JobService } from '../../job'
import { IMessage } from '@/domain/entity/message'
import { IMessageButton } from '@/domain/entity/messageButton'
import { NotFoundError } from '@/domain/errors'
import { FileType, MessageStatus, ModelAccountStatus } from '@prisma/client'
import { ModelService } from '../../model'
import { MidjourneyService } from '../../midjourney'
import { UserService } from '../../user'
import { SubscriptionService } from '../../subscription'
import { ModerationService } from '../../moderation'
import { DefineButtonsAndImages } from './defineButtons'
import { Callback } from './callback'
import { MessageStorage } from '../storage/types'
import { IUser } from '@/domain/entity/user'
import { ProcessMj, ProcessMjParams } from './processMj'
import { determinePlatform } from '@/domain/entity/action'

type Params = Adapter & {
  defineButtonsAndImages: DefineButtonsAndImages
  callback: Callback
  chatService: ChatService
  jobService: JobService
  subscriptionService: SubscriptionService
  modelService: ModelService
  userService: UserService
  midjourneyService: MidjourneyService
  moderationService: ModerationService
  messageStorage: MessageStorage
  processMj: ProcessMj
}

export type MidjourneyButtonClick = (params: { button: IMessageButton; user: IUser; keyEncryptionKey: string | null }) => Promise<IMessage>

export const buildMidjourneyButtonClick = ({
  defineButtonsAndImages,
  callback,
  processMj,
  modelAccountRepository,
  chatService,
  jobService,
  messageStorage,
  messageRepository,
  userService,
  fileRepository,
  chatRepository,
  modelService,
  userRepository,
  subscriptionService
}: Params): MidjourneyButtonClick => {
  return async ({ button, user, keyEncryptionKey }) => {
    if (!button.mj_account_id || !button.mj_message_id || !button.mj_native_label || !button.mj_native_custom) {
      throw new NotFoundError({
        code: 'MESSAGE_BUTTON_NOT_FOUND'
      })
    }

    if (!button.message || !button.message.chat) {
      throw new NotFoundError({
        code: 'MESSAGE_NOT_FOUND'
      })
    }

    let { chat, user_id: userId, platform, model, model_version, mj_mode } = button.message
    const { mj_account_id: accountId, mj_native_custom: buttonCustom, mj_message_id: nativeMessageId } = button

    const mjJob = await jobService.create({
      name: 'MODEL_GENERATION',
      chat
    })

    let mjMessage = await messageStorage.create({
      user,
      keyEncryptionKey,
      data: {
        data: {
          role: 'assistant',
          status: MessageStatus.PENDING,
          chat_id: chat.id,
          user_id: userId,
          model_id: chat.model_id,
          ...(model && {
            model_id: model.id
          }),
          model_version: model_version,
          mj_mode: mj_mode,
          job_id: mjJob.id
        },
        include: {
          model: {
            include: {
              icon: true
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
          message: mjMessage
        }
      }
    })
    ;(async () => {
      try {
        await mjJob.start()

        chatService.eventStream.emit({
          chat,
          event: {
            name: 'MESSAGE_UPDATE',
            data: {
              message: {
                id: mjMessage.id,
                job_id: mjJob.id,
                job: mjJob.job
              }
            }
          }
        })

        const account = await modelAccountRepository.get({
          where: {
            id: accountId,
            status: ModelAccountStatus.FAST
          }
        })

        if (!account || !account.mj_channel_id || !account.mj_server_id || !account.mj_token)
          throw new NotFoundError({
            code: 'MIDJOURNEY_QUEUES_NOT_FOUND'
          })

        const imagineParams: ProcessMjParams = {
          modelFunction: 'button',
          message: {
            ...mjMessage
          },
          callback: callback({ mjJob, chat, messageId: mjMessage.id }),
          button: {
            messageId: nativeMessageId,
            buttonCustom
          }
        }
        const buttonClickResult = await processMj({
          account,
          mjConfig: {
            accountId,
            ChannelId: account.mj_channel_id,
            SalaiToken: account.mj_token,
            ServerId: account.mj_server_id
          },
          imagineParams
        })

        if (!buttonClickResult) return mjJob

        await mjJob.update({
          mj_native_message_id: nativeMessageId
        })

        const { messageImages, messageButtons } = await defineButtonsAndImages({
          generationResult: buttonClickResult,
          messageId: mjMessage.id
        })

        const caps = await modelService.getCaps({
          model: mjJob.chat.model!,
          message: mjMessage!
        })

        if (!userId) {
          throw new NotFoundError({
            code: 'USER_NOT_FOUND'
          })
        }

        const user = await userRepository.get({
          where: {
            id: userId
          },
          include: {
            employees: {
              include: {
                enterprise: true
              }
            }
          }
        })

        if (!user) {
          throw new NotFoundError({
            code: 'USER_NOT_FOUND'
          })
        }

        const employee = user.employees && user.employees.length > 0 ? user.employees[0] : null
        const userSubscription = await userService.getActualSubscription(user)

        if (!userSubscription) {
          throw new NotFoundError({
            code: 'USER_SUBSCRIPTION_NOT_FOUND'
          })
        }

        const writeOffResult = await subscriptionService.writeOffWithLimitNotification({
          subscription: userSubscription,
          amount: caps,
          meta: {
            userId,
            enterpriseId: employee?.enterprise_id,
            platform: determinePlatform(platform ?? undefined, !!employee?.enterprise_id),
            model_id: mjJob.chat.model_id!
          }
        })
        const { transaction, subscription: updatedSubscription } = writeOffResult

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

        const files = await fileRepository.createMany(
          messageImages.map((messageImage) => ({
            data: {
              type: FileType.IMAGE,
              path: messageImage.original?.path
            }
          }))
        )

        const imageUrls: string[] = []

        for (const messageImage of messageImages) {
          if (!messageImage.original || !messageImage.original.url) {
            continue
          }

          imageUrls.push(messageImage.original.url)
        }

        await mjJob.update({
          mj_native_message_id: nativeMessageId
        })

        await mjJob.done()

        mjMessage =
          (await messageRepository.update({
            where: {
              id: mjMessage.id
            },
            data: {
              status: MessageStatus.DONE,
              transaction_id: transaction.id,
              additional_content: {
                imageUrls
              },
              images: {
                connect: messageImages.map(({ id }) => ({ id }))
              },
              buttons: {
                connect: messageButtons.map(({ id }) => ({ id }))
              },
              attachments: {
                createMany: {
                  data: files.map((file) => ({
                    file_id: file.id
                  }))
                }
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
              buttons: {
                where: {
                  disabled: false
                }
              },
              all_buttons: {
                distinct: ['action']
              },
              job: true,
              attachments: {
                include: {
                  file: true
                }
              }
            }
          })) ?? mjMessage

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
              message: mjMessage!
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
                id: updatedSubscription.id,
                balance: updatedSubscription.balance
              }
            }
          }
        })
      } catch (error) {
        await mjJob.setError(error)

        chatService.eventStream.emit({
          chat,
          event: {
            name: 'MESSAGE_UPDATE',
            data: {
              message: {
                id: mjMessage.id,
                job_id: mjJob.id,
                job: mjJob.job
              }
            }
          }
        })
        throw error
      }
    })()

    return mjMessage
  }
}
