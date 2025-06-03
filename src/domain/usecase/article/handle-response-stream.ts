import { concatMap, Observable } from 'rxjs'
import { Platform } from '@prisma/client'
import { IModel } from '@/domain/entity/model'
import { ISubscription } from '@/domain/entity/subscription'
import { IEmployee } from '@/domain/entity/employee'
import { IChatTextSettings } from '@/domain/entity/chatSettings'
import { UseCaseParams } from '../types'

export type HandleResponseStream = (params: {
  userId: string
  model: IModel
  prompt: string
  subscription: ISubscription | null
  employee: IEmployee | null
  settings: Partial<IChatTextSettings> & {
    system_prompt: string
  }
  isAdmin?: boolean
}) => Promise<{
  responseStream$: Observable<{
    status: 'pending' | 'done'
    contentDelta: string
    spentCaps: number | null
    caps: bigint | null
  }>
  closeStream: () => void
}>

export const buildHandleResponseStream = ({ service }: UseCaseParams): HandleResponseStream => {
  return async ({ userId, model, subscription, employee, settings, isAdmin }) => {
    const textStream$ = await service.message.text.sendByProvider({
      providerId: null,
      user: {
        id: userId
      },
      model,
      messages: [],
      settings,
      planType: subscription?.plan?.type ?? null
    })

    let prompt_tokens = 0
    let completion_tokens = 0
    let generationCompleted = false

    const onGenerationEnd = async () => {
      const caps = await service.model.getCaps({
        model: model,
        usage: {
          prompt_tokens,
          completion_tokens
        }
      })
      let writeOff = { subscription: { balance: 0n } }
      if (!isAdmin && subscription) {
        writeOff = await service.subscription.writeOffWithLimitNotification({
          subscription,
          amount: caps,
          meta: {
            userId: userId,
            enterpriseId: employee?.enterprise_id,
            platform: Platform.EASY_WRITER,
            model_id: model.id
          }
        })
      }

      return {
        spentCaps: caps,
        currentCaps: isAdmin ? 0n : writeOff.subscription.balance
      }
    }

    const responseStream$ = textStream$.pipe(
      concatMap(async ({ status, value, usage }) => {
        if (status === 'pending') {
          return {
            status,
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
              contentDelta: '',
              spentCaps: null,
              caps: null
            }
          }
          generationCompleted = true

          const { spentCaps, currentCaps } = await onGenerationEnd()

          return {
            status,
            contentDelta: '',
            spentCaps: spentCaps,
            caps: currentCaps
          }
        }

        return {
          status,
          contentDelta: '',
          spentCaps: null,
          caps: null
        }
      })
    )

    return {
      responseStream$,
      closeStream: async () => {
        textStream$.stream.controller.abort()

        if (generationCompleted) {
          return
        }
        generationCompleted = true

        // calculate spent caps for stopped completion
        await onGenerationEnd()
      }
    }
  }
}
