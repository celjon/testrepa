import { ChatCompletionMessageParam } from 'openai/resources'
import { config } from '@/config'
import { ModelProvider } from '@prisma/client'

export interface IModelProvider extends ModelProvider {
  fallback?: IModelProvider | null
}

export const isOpenAIProvider = (provider: IModelProvider) =>
  provider.id === config.model_providers.openai.id

export const isOpenRouterProvider = (provider: IModelProvider) =>
  provider.id === config.model_providers.openrouter.id

export const isG4FProvider = (provider: IModelProvider) =>
  provider.id === config.model_providers.g4f.id ||
  provider.parent_id === config.model_providers.g4f.id

export const isMidjourneyProvider = (provider: IModelProvider) =>
  provider.id === config.model_providers.midjourney.id ||
  provider.parent_id === config.model_providers.midjourney.id

export const isReplicateProvider = (provider: IModelProvider) =>
  provider.id === config.model_providers.replicate.id

export const isRunwayProvider = (provider: IModelProvider) => provider.id === 'runway'

export const isGoogleGenAIProvider = (provider: IModelProvider) =>
  provider.id === config.model_providers.googleGenAI.id

export const isai302Provider = (provider: IModelProvider) =>
  provider.id === config.model_providers.ai302.id

export const hasOpenrouterParams = (params: {
  messages: Array<ChatCompletionMessageParam>
  [key: string]: unknown
}) => {
  return (
    !!params.transforms ||
    !!params.models ||
    !!params.route ||
    !!params.provider ||
    !!params.reasoning ||
    !!params.plugins
  )
}
