import { ChatCompletionMessageParam } from 'openai/resources'
import { Platform } from '@prisma/client'
import { logger } from '@/lib/logger'
import { ForbiddenError, InternalError, NotFoundError } from '@/domain/errors'
import { IMessage } from '@/domain/entity/message'
import { UseCaseParams } from '@/domain/usecase/types'
import { buildSendSyncTextByProvider } from './completions.sync.send-by-provider'

export type CompletionsSync = (p: {
  userId: string
  params: {
    model: string
    messages: Array<ChatCompletionMessageParam & IMessage>
    [key: string]: unknown
  }
  developerKeyId?: string
}) => Promise<unknown>

export const buildCompletionsSync = ({ adapter, service }: UseCaseParams): CompletionsSync => {
  const sendByProvider = buildSendSyncTextByProvider({
    adapter,
    service,
  })

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

    const { result, provider_id } = await sendByProvider({
      providerId: null,
      apiParams: params,
      model,
      user: {
        id: userId,
      },
    })

    if (!result.usage) {
      logger.error({
        location: 'completions.sync',
        message: 'Unable to correctly calculate usage',
        model_id: model.id,
        result,
      })
      throw new InternalError({
        code: 'UNABLE_TO_CALCULATE_USAGE',
        message: 'Unable to correctly calculate usage',
        data: result,
      })
    }

    const caps = await service.model.getCaps.text({
      model,
      usage: result.usage,
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

    return result.response
  }
}
