import { ChatCompletionMessageParam } from 'openai/resources'
import { Platform } from '@prisma/client'
import { RawStream } from '@/adapter/gateway/types'
import { ForbiddenError, NotFoundError } from '@/domain/errors'
import { IMessage } from '@/domain/entity/message'
import { UseCaseParams } from '@/domain/usecase/types'
import { buildSendStreamTextByProvider } from './completions.stream.send-by-provider'

export type CompletionsStream = (p: {
  userId: string
  params: {
    model: string
    messages: Array<ChatCompletionMessageParam & IMessage>
    [key: string]: unknown
  }
  developerKeyId?: string
}) =>
  | Promise<{
      responseStream: RawStream
    }>
  | never

export const buildCompletionsStream = ({ adapter, service }: UseCaseParams): CompletionsStream => {
  const sendByProvider = buildSendStreamTextByProvider({ adapter, service })

  return async ({ userId, params, developerKeyId }) => {
    if (params.model === 'auto') {
      throw new ForbiddenError({
        code: 'INVALID_MODEL',
      })
    }

    const model = await adapter.modelRepository.get({
      where: {
        id: params.model,
      },
    })

    if (!model) {
      throw new NotFoundError({
        code: 'MODEL_NOT_FOUND',
      })
    }

    const subscription = await service.user.getActualSubscriptionById(userId)

    await service.subscription.checkBalance({ subscription, estimate: 0 })

    const { hasAccess, reasonCode } = await service.plan.hasAccessToAPI({
      plan: subscription!.plan!,
    })

    if (!hasAccess) {
      throw new ForbiddenError({
        code: reasonCode ?? 'MODEL_NOT_ALLOWED_FOR_PLAN',
      })
    }

    const result = await sendByProvider({
      apiParams: params,
      providerId: null,
      model: model,
      user: {
        id: userId,
      },
      onEnd: async ({ usage, provider_id }) => {
        if (usage) {
          const caps = await service.model.getCaps.text({
            model,
            usage,
          })

          await service.subscription.writeOffWithLimitNotification({
            subscription: subscription!,
            amount: caps,
            meta: {
              userId: userId,
              platform: Platform.API_COMPLETIONS,
              model_id: model.id,
              provider_id,
              developerKeyId,
            },
          })
        }
      },
    })

    const { responseStream } = result

    return {
      responseStream,
    }
  }
}
