import { config } from '@/config'
import { UseCaseParams } from '@/domain/usecase/types'

export type Models = (p: { userId: string }) => Promise<unknown>

export const buildModels = ({ service, adapter }: UseCaseParams): Models => {
  return async ({ userId }) => {
    const subscription = await service.user.getActualSubscriptionById(userId)

    await service.subscription.checkBalance({ subscription, estimate: 0 })

    let models = await adapter.modelRepository.list({
      where: {
        parent_id: { not: null },
        deleted_at: null,
      },
      orderBy: {
        parent: {
          order: 'asc',
        },
      },
      include: {
        providers: true,
      },
    })

    return models
      .filter((model) => {
        if (!model.providers?.length) {
          return false
        }

        const hasEnabledProvider = model.providers.some((provider) => !provider.disabled)

        if (!hasEnabledProvider) {
          return false
        }

        const hasOpenrouterProvider = !!model.providers.find(
          (provider) => provider.id === config.model_providers.openrouter.id,
        )
        if (hasOpenrouterProvider) {
          return true
        }

        const hasOpenAIProvider = !!model.providers.find(
          (provider) => provider.id === config.model_providers.openai.id,
        )
        if (
          hasOpenAIProvider &&
          !!model.features?.find((feature) =>
            ['TEXT_TO_IMAGE', 'AUDIO_TO_TEXT', 'TEXT_TO_AUDIO', 'EMBEDDING'].includes(feature),
          )
        ) {
          return true
        }

        return false
      })
      .sort((modelA, modelB) => modelA.order - modelB.order)
      .sort((modelA, modelB) => {
        if (!modelA.parent || !modelB.parent) {
          return 0
        }

        return modelA.parent.order - modelB.parent.order
      })
      .map((model) => ({
        id: model.id,
        created: Math.floor(model.created_at.getTime() / 1000),
        object: 'model',
        owned_by: model.owned_by,
      }))
  }
}
