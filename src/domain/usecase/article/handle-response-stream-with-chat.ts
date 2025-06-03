import { catchError, concatMap, Observable } from 'rxjs'
import { MessageStatus, Platform } from '@prisma/client'
import { BaseError, InternalError, NotFoundError } from '@/domain/errors'
import { UseCaseParams } from '@/domain/usecase/types'
import { IChat } from '@/domain/entity/chat'
import { IModel } from '@/domain/entity/model'
import { ISubscription } from '@/domain/entity/subscription'
import { IEmployee } from '@/domain/entity/employee'
import { TextObservable } from '@/domain/service/message/text/sendByProvider'
import { IUser } from '@/domain/entity/user'

export type HandleResponseStreamWithChat = (params: {
  user: IUser
  keyEncryptionKey: string | null
  chat: IChat
  model: IModel
  prompt: string
  subscription: ISubscription | null
  employee: IEmployee | null
  textStream$: TextObservable
  additionalCaps: number
  isAdmin?: boolean
}) => Promise<{
  responseStream$: Observable<{
    status: 'pending' | 'done'
    content: string
    contentDelta: string
    spentCaps: number | null
    caps: bigint | null
  }>
  closeStream: () => void
}>

export const buildHandleResponseStreamWithChat = ({ service, adapter }: UseCaseParams): HandleResponseStreamWithChat => {
  return async ({ user, keyEncryptionKey, chat, model, subscription, employee, textStream$, additionalCaps, isAdmin }) => {
    if (!chat.settings || !chat.settings.text) {
      throw new NotFoundError({
        code: 'CHAT_SETTINGS_NOT_FOUND'
      })
    }

    const textJob = await service.job.create({
      name: 'MODEL_GENERATION',
      chat
    })

    // create pending assistant message
    let assistantMessage = await service.message.storage.create({
      user,
      keyEncryptionKey,
      data: {
        data: {
          role: 'assistant',
          status: MessageStatus.PENDING,
          chat_id: chat.id,
          user_id: user.id,
          model_id: model.id,
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

    service.chat.eventStream.emit({
      chat,
      event: {
        name: 'MESSAGE_CREATE',
        data: {
          message: assistantMessage
        }
      }
    })

    await textJob.start({
      stop: () => {
        textStream$.stream.controller.abort()
      }
    })

    let content = ''
    let prompt_tokens = 0
    let completion_tokens = 0

    const handleError = async (error: unknown) => {
      if (!(error instanceof BaseError)) {
        error = new InternalError({
          code: 'INTERNAL_ERROR'
        })
      }
      const errorJob = await textJob.setError(error)

      service.chat.eventStream.emit({
        chat,
        event: {
          name: 'MESSAGE_UPDATE',
          data: {
            message: {
              id: assistantMessage.id,
              job_id: errorJob.id,
              job: errorJob
            }
          }
        }
      })
    }

    const onGenerationEnd = async (isError = false) => {
      const total_tokens = prompt_tokens + completion_tokens
      let caps = await service.model.getCaps({
        model: model,
        usage: {
          prompt_tokens,
          completion_tokens
        }
      })

      if (!isError) {
        caps += additionalCaps
      }

      let writeOff
      if (!isAdmin && subscription) {
        writeOff = await service.subscription.writeOffWithLimitNotification({
          subscription,
          amount: caps,
          meta: {
            userId: user.id,
            enterpriseId: employee?.enterprise_id,
            platform: Platform.EASY_WRITER,
            model_id: model.id
          }
        })
      }

      await adapter.chatRepository.update({
        where: { id: chat.id },
        data: {
          total_caps: { increment: caps }
        }
      })

      assistantMessage = isAdmin
        ? assistantMessage
        : ((await service.message.storage.update({
            user,
            keyEncryptionKey,
            data: {
              where: { id: assistantMessage.id },
              data: {
                status: MessageStatus.DONE,
                tokens: total_tokens,
                transaction_id: writeOff ? writeOff.transaction.id : '',
                content
              }
            }
          })) ?? assistantMessage)

      service.chat.eventStream.emit({
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
      service.chat.eventStream.emit({
        chat,
        event: {
          name: 'MESSAGE_UPDATE',
          data: {
            message: assistantMessage
          }
        }
      })
      if (!isAdmin && writeOff) {
        service.chat.eventStream.emit({
          chat,
          event: {
            name: 'TRANSACTION_CREATE',
            data: {
              transaction: writeOff.transaction
            }
          }
        })
      }
      if (!isAdmin && subscription) {
        service.chat.eventStream.emit({
          chat,
          event: {
            name: service.user.hasEnterpriseActualSubscription(user) ? 'ENTERPRISE_SUBSCRIPTION_UPDATE' : 'SUBSCRIPTION_UPDATE',
            data: {
              subscription: {
                id: subscription.id,
                balance: subscription.balance
              }
            }
          }
        })
      }
      return {
        spentCaps: caps,
        currentCaps: writeOff ? writeOff.subscription.balance : 0n
      }
    }

    let generationCompleted = false

    try {
      const responseStream$ = textStream$.pipe(
        concatMap(async ({ status, value, usage }) => {
          if (status === 'pending') {
            content += value

            service.chat.eventStream.emit({
              chat,
              event: {
                name: 'MESSAGE_UPDATE',
                data: {
                  message: {
                    id: assistantMessage.id,
                    content
                  }
                }
              }
            })

            return {
              status,
              content,
              contentDelta: value,
              spentCaps: null,
              caps: null
            }
          }

          if (status === 'done' && usage !== null) {
            prompt_tokens += usage.prompt_tokens
            completion_tokens += usage.completion_tokens

            if (generationCompleted) {
              return {
                status,
                content,
                contentDelta: value,
                spentCaps: null,
                caps: null
              }
            }
            generationCompleted = true

            await textJob.done()
            const { spentCaps, currentCaps } = await onGenerationEnd()

            return {
              status,
              content,
              contentDelta: '',
              spentCaps: spentCaps,
              caps: currentCaps
            }
          }

          return {
            status,
            content,
            contentDelta: '',
            spentCaps: null,
            caps: null
          }
        }),
        catchError((error) => {
          handleError(error)
          throw error
        })
      )
      return {
        responseStream$,
        closeStream: async () => {
          await textJob.stop()

          if (generationCompleted) {
            return
          }
          generationCompleted = true

          await onGenerationEnd(true)
        }
      }
    } catch (error) {
      handleError(error)
      throw error
    }
  }
}
