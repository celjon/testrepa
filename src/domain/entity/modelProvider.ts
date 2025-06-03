import { config } from '@/config'
import { ModelProvider } from '@prisma/client'

export interface IModelProvider extends ModelProvider {
  fallback?: IModelProvider | null
}

export const isOpenAIProvider = (provider: IModelProvider) => provider.id === config.model_providers.openai.id

export const isOpenRouterProvider = (provider: IModelProvider) => provider.id === config.model_providers.openrouter.id

export const isG4FProvider = (provider: IModelProvider) =>
  provider.id === config.model_providers.g4f.id || provider.parent_id === config.model_providers.g4f.id

export const isMidjourneyProvider = (provider: IModelProvider) =>
  provider.id === config.model_providers.midjourney.id || provider.parent_id === config.model_providers.midjourney.id

export const isReplicateProvider = (provider: IModelProvider) => provider.id === config.model_providers.replicate.id

export const isRunwayProvider = (provider: IModelProvider) => provider.id === 'runway'
