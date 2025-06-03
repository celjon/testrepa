import { ChatCompletionMessageParam } from 'openai/resources'
import { Platform } from '@prisma/client'
import { Readable } from 'stream'
import { logger } from '@/lib/logger'
import { ForbiddenError, NotFoundError } from '@/domain/errors'
import { IMessage } from '@/domain/entity/message'
import { UseCaseParams } from '@/domain/usecase/types'

export type CompletionsStream = (p: {
  userId: string
  params: {
    model: string
    messages: Array<ChatCompletionMessageParam & IMessage>
    [key: string]: unknown
  }
}) =>
  | Promise<{
      responseBytesStream: Readable
      breakNotifier: () => void
    }>
  | never

export const buildCompletionsStream = ({ adapter, service }: UseCaseParams): CompletionsStream => {
  return async ({ userId, params }) => {
    if (params.model === 'auto') {
      throw new ForbiddenError({
        code: 'INVALID_MODEL'
      })
    }

    const model = await adapter.modelRepository.get({
      where: {
        id: params.model
      }
    })

    if (!model) {
      throw new NotFoundError({
        code: 'MODEL_NOT_FOUND'
      })
    }

    const subscription = await service.user.getActualSubscriptionById(userId)

    if (!subscription || (subscription && subscription.balance <= 0) || !subscription.plan) {
      throw new ForbiddenError({
        code: 'NOT_ENOUGH_TOKENS'
      })
    }

    const { hasAccess, reasonCode } = await service.plan.hasAccessToAPI({ plan: subscription.plan })

    if (!hasAccess) {
      throw new ForbiddenError({
        code: reasonCode ?? 'MODEL_NOT_ALLOWED_FOR_PLAN'
      })
    }

    const result = await adapter.openrouterGateway.raw.completions.create.stream(
      {
        ...params,
        model: model.prefix + model.id,
        endUserId: userId
      },
      async (_, usage) => {
        if (usage) {
          const caps = await service.model.getCaps({
            model,
            usage
          })

          await service.subscription.writeOffWithLimitNotification({
            subscription,
            amount: caps,
            meta: {
              userId: userId,
              platform: Platform.API_COMPLETIONS,
              model_id: model.id
            }
          })
        } else {
          logger.error({
            location: 'completions.stream',
            message: 'Unable to correctly calculate usage',
            model_id: model.id
          })
        }
      }
    )

    const { responseBytesStream, breakNotifier } = result

    return {
      responseBytesStream,
      breakNotifier
    }
  }
}
