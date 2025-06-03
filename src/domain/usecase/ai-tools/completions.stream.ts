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
    enable_web_search?: boolean
    [key: string]: unknown
  }
}) =>
  | Promise<{
      responseBytesStream: Readable
      breakNotifier: () => void
    }>
  | never

export const buildCompletionsStream = ({ adapter, service }: UseCaseParams): CompletionsStream => {
  return async ({ userId, params: { enable_web_search, ...params } }) => {
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

    let webSearchCaps = 0
    if (enable_web_search) {
      const lastMessage = params.messages[params.messages.length - 1]
      const prompt = lastMessage.full_content ?? lastMessage.content ?? ''

      const { caps, promptAddition, systemPromptAddition } = await service.aiTools.performWebSearch({
        userId: userId,
        model,
        prompt,
        messages: params.messages.slice(0, -1).map((m) => ({
          role: m.role,
          content: m.full_content ?? m.content ?? ''
        })),
        locale: 'ru'
      })
      webSearchCaps += caps
      if (promptAddition) {
        if (lastMessage.full_content) {
          lastMessage.full_content += `\n${promptAddition}`
        }
        lastMessage.content += `\n${promptAddition}`
      }
      if (systemPromptAddition) {
        const systemMessage = params.messages.find((m) => m.role === 'system')
        if (systemMessage) {
          if (systemMessage.full_content) {
            systemMessage.full_content += `\n${systemPromptAddition}`
          }
          systemMessage.content += `\n${systemPromptAddition}`
        }
      }
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
            amount: caps + webSearchCaps,
            meta: {
              userId: userId,
              platform: Platform.API_COMPLETIONS,
              model_id: model.id,
              expense_details: {
                web_search: webSearchCaps
              }
            }
          })
        } else {
          logger.error({
            location: 'aiTools.completions.stream',
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
