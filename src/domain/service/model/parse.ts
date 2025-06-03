import { config } from '@/config'
import { Adapter } from '../../types'
import { ModelCustomAction, Prisma } from '@prisma/client'
import { logger } from '@/lib/logger'
import { isDeepseekR1, isMidjourney, isStableDiffusion, isVeo } from '@/domain/entity/model'
import { TgBotParseMode } from '@/lib/clients/tg-bot'
import { AudioPricing, ImageLLMPricing, ImagePricing, SpeechPricing, TextPricing } from './pricing-schemas'

type ParsedModelProvider = {
  id: string
  name?: string | null
  label?: string
  fallback?: ParsedModelProvider
  children?: Omit<ParsedModelProvider, 'children'>[]
}

type ParsedModelFunction = {
  id: string
  name: string
  label?: string
  is_default?: boolean
  features?: string[]
}

type ParsedModel = {
  id: string
  label?: string | null
  icon_id?: string
  pricing?: {
    input?: number
    input_image?: number
    output?: number
    relax_mode?: number
    fast_mode?: number
    turbo_mode?: number
    standard?: {
      ['1024x1024']?: number
      ['1792x1024']?: number
    }
    hd?: {
      ['1024x1024']?: number
      ['1792x1024']?: number
    }
    per_image?: number
    per_second?: number
    discount: number
  }
  prefix?: string
  context_length?: number
  max_tokens?: number
  message_color?: string
  features?: string[]
  functions?: ParsedModelFunction[]
  providers?: ParsedModelProvider[]
  provider_id?: string | null
  child_provider_id?: string | null
  discount?: number
  order?: number
  children?: Omit<ParsedModel, 'children'>[]
  custom?: boolean
  created_at?: Date
}

export type Parse = () => Promise<ParsedModel[]>

export const buildParse =
  ({
    modelRepository,
    planModelRepository,
    modelProviderRepository,
    modelCustomRepository,
    openaiGateway,
    g4fGateway,
    openrouterGateway,
    tgNotificationBotGateway,
    replicateGateway
  }: Adapter): Parse =>
  async () => {
    logger.info('Starting model parsing.')
    let parsedModels: ParsedModel[] = []

    const [openaiModels, g4fProviders, g4fModels, openRouterModels, openRouterProviders, replicateModels] = await Promise.all([
      openaiGateway.getModels().then((models) => {
        logger.info(`Fetched ${models.length} OpenAI models.`)

        return models
      }),
      g4fGateway.getProviders().then((providers) => {
        logger.info(`Fetched ${providers.length} GPT4FREE providers.`)

        return providers.filter((provider) => provider.id === 'OpenaiAccount')
      }),
      g4fGateway.getModels('OpenaiAccount').then((models) => {
        logger.info(`Fetched ${models.length} GPT4FREE models.`)
        return models
      }),
      openrouterGateway.getModels().then((models) => {
        logger.info(`Fetched ${models.length} OpenRouter models.`)

        return models
      }),
      openrouterGateway.getProviders().then((providers) => {
        logger.info(`Fetched ${providers.length} OpenRouter providers.`)

        return providers
      }),
      replicateGateway.getModels().then((models) => {
        logger.info(`Fetched ${models.length} Replicate models.`)

        return models
      })
    ])

    // Parse OpenAI Models
    logger.info('Parsing OpenAI models.')
    const parsedOpenAIProvider = config.model_providers.openai satisfies ParsedModelProvider
    const parsedOpenAI = {
      id: 'openai',
      label: 'OpenAI',
      features: ['TEXT_TO_TEXT', 'DOCUMENT_TO_TEXT'],
      providers: [parsedOpenAIProvider],
      children: [] as ParsedModel[]
    } satisfies ParsedModel

    for (const openaiModel of openaiModels) {
      const features: string[] = []

      if (openaiModel.id.match(/^gpt-image/)) {
        features.push('TEXT_TO_IMAGE', 'TEXT_TO_IMAGE_LLM')
      } else if (openaiModel.id.match(/^gpt/)) {
        features.push('TEXT_TO_TEXT', 'DOCUMENT_TO_TEXT')
      } else if (openaiModel.id.match(/^dall-e/)) {
        features.push('TEXT_TO_IMAGE')
      } else if (openaiModel.id.match(/^tts/)) {
        features.push('TEXT_TO_AUDIO')
      } else if (openaiModel.id.match(/^whisper/)) {
        features.push('AUDIO_TO_TEXT')
      }

      parsedOpenAI.children.push({
        id: openaiModel.id,
        pricing: {
          input: 1,
          discount: 1,
          ...(features.includes('TEXT_TO_TEXT') &&
            ({
              input: 1,
              input_image: 1,
              output: 1,
              discount: 1
            } satisfies TextPricing)),
          ...(features.includes('TEXT_TO_IMAGE_LLM') &&
            ({
              input: ((5 / 1_000_000) * 1.5) / 0.000002,
              input_image: ((10 / 1_000_000) * 1.5) / 0.000002,
              output: ((40 / 1_000_000) * 1.5) / 0.000002,
              discount: 1
            } satisfies ImageLLMPricing)),
          ...(openaiModel.id.match(/^dall-e/) &&
            ({
              standard: {
                '1024x1024': 20000,
                '1792x1024': 40000
              },
              hd: {
                '1024x1024': 20000,
                '1792x1024': 40000
              },
              discount: 1
            } satisfies ImagePricing)),
          ...(openaiModel.id.match(/^tts-1/) &&
            ({
              input: 7.5,
              discount: 1
            } satisfies SpeechPricing)),
          ...(openaiModel.id.match(/^tts-1-hd/) &&
            ({
              input: 15,
              discount: 1
            } satisfies SpeechPricing)),
          ...(openaiModel.id.match(/^whisper/) &&
            ({
              input: 3000,
              discount: 1
            } satisfies AudioPricing))
        },
        context_length: 4095,
        max_tokens: 4096,
        features,
        providers: [parsedOpenAIProvider],
        created_at: new Date(openaiModel.created * 1000)
      })
    }

    logger.info(`Parsed ${parsedOpenAI.children.length} OpenAI models.`)
    parsedModels.push(parsedOpenAI)

    // Parse ImaginePro Models
    logger.info('Parsing ImaginePro models.')
    const parsedImagineProProvider = config.model_providers.imaginepro satisfies ParsedModelProvider
    const parsedMidjourneyProvider = config.model_providers.midjourney satisfies ParsedModelProvider
    const parsedMidjourneyModel = {
      id: 'midjourney',
      label: 'Midjourney',
      pricing: {
        relax_mode: 20000,
        fast_mode: 40000,
        turbo_mode: 80000,
        discount: 1
      },
      providers: [parsedImagineProProvider],
      features: ['TEXT_TO_IMAGE', 'IMAGE_TO_TEXT'],
      functions: [
        {
          id: 'imagine',
          name: 'imagine',
          label: 'Imagine',
          is_default: true,
          features: ['TEXT_TO_IMAGE', 'IMAGE_TO_TEXT']
        },
        {
          id: 'describe',
          name: 'describe',
          label: 'Describe',
          features: ['IMAGE_TO_TEXT']
        }
      ]
    } satisfies ParsedModel

    logger.info('Parsed ImaginePro models.')
    parsedModels.push(parsedMidjourneyModel)

    // Parse OpenRouter Models
    logger.info('Parsing OpenRouter models.')
    const parsedOpenRouterProvider = {
      ...config.model_providers.openrouter,
      fallback: parsedOpenAIProvider,
      children: openRouterProviders.map((openRouterProvider) => ({
        id: `${config.model_providers.openrouter.id}-${openRouterProvider.replace(/ /g, '-').toLowerCase()}`,
        name: openRouterProvider
      }))
    } satisfies ParsedModelProvider

    openRouterModels.push({
      id: 'anthropic/claude-3.7-sonnet:thinking',
      name: 'Anthropic: Claude 3.7 Sonnet Thinking',
      created: 1740422110,
      description: '',
      context_length: 200000,
      architecture: {
        modality: 'text+image->text',
        tokenizer: 'Claude',
        instruct_type: ''
      },
      pricing: {
        prompt: '0.000003',
        completion: '0.000015',
        request: '0',
        image: '0.0048',
      },
      top_provider: {
        max_completion_tokens: 64000,
        is_moderated: false
      },
      per_request_limits: null,
    })

    for (const openRouterModel of openRouterModels) {
      if (openRouterModel.id === 'auto') {
        continue
      }

      const idMatch = openRouterModel.id.match(/^([a-zA-Z0-9-.]+)\/([a-zA-Z0-9-.:]+)$/)

      if (!idMatch) {
        continue
      }

      const parentModelId = idMatch[1]
      const childModelId = idMatch[2]
      const prefix = `${parentModelId}/`
      let parsedParentModel: ParsedModel | null = parsedModels.find(({ id }) => id === parentModelId) ?? null

      if (!parsedParentModel) {
        const nameMatch = openRouterModel.name.match(/^([a-zA-Z0-9-.() ]+): ([a-zA-Z0-9-.() ]+)$/)
        let parentModelName: string | null

        if (nameMatch) {
          parentModelName = nameMatch[1]
        } else {
          const nameMatch = openRouterModel.name.match(/^([a-zA-Z]+)/)

          if (nameMatch) {
            parentModelName = nameMatch[1]
          } else {
            parentModelName = null
          }
        }
        if (parsedModels.some(({ label }) => label === parentModelName)) {
          parentModelName = `${parentModelName} (${parentModelId})`
        }

        parsedModels.push(
          (parsedParentModel = {
            id: parentModelId,
            label: parentModelName,
            prefix,
            providers: [parsedOpenRouterProvider],
            children: []
          })
        )
      } else if (parsedParentModel.providers) {
        parsedParentModel.prefix = prefix

        if (!parsedParentModel.providers.some(({ id }) => id === parsedOpenRouterProvider.id)) {
          parsedParentModel.providers.push(parsedOpenRouterProvider)
        }
      }
      if (!parsedParentModel.children) {
        continue
      }

      let parsedChildModel: ParsedModel | null = parsedParentModel.children.find(({ id }) => id === childModelId) ?? null

      const pricing = {
        input: (+openRouterModel.pricing.prompt * 1.5) / 0.000002,
        input_image: (+openRouterModel.pricing.image * 1.5) / 1_000 / 0.000002,
        output: (+openRouterModel.pricing.completion * 1.5) / 0.000002,
        discount: 1
      }
      const contextLength = openRouterModel.context_length
      const maxTokens = openRouterModel.top_provider.max_completion_tokens

      const features: string[] = []
      switch (openRouterModel.architecture.modality) {
        case 'text+image->text':
          features.push('TEXT_TO_TEXT', 'DOCUMENT_TO_TEXT', 'IMAGE_TO_TEXT')
          break
        default:
          features.push('TEXT_TO_TEXT', 'DOCUMENT_TO_TEXT')
          break
      }

      if (isDeepseekR1({ id: childModelId })) {
        features.push('CHAIN_OF_THOUGHT')
      }

      if (!parsedChildModel) {
        parsedParentModel.children.push(
          (parsedChildModel = {
            id: childModelId,
            pricing,
            prefix,
            context_length: contextLength,
            max_tokens: maxTokens,
            features,
            providers: [parsedOpenRouterProvider]
          })
        )
      } else if (parsedChildModel.providers) {
        parsedChildModel.pricing = pricing
        parsedChildModel.prefix = prefix
        parsedChildModel.context_length = contextLength
        parsedChildModel.max_tokens = maxTokens
        parsedChildModel.features = [...new Set([...(parsedChildModel.features ?? []), ...features])]

        if (!parsedChildModel.providers.some(({ id }) => id === parsedOpenRouterProvider.id)) {
          parsedChildModel.providers.push(parsedOpenRouterProvider)
        }
      }
    }
    logger.info('Parsed OpenRouter models.')

    // Parse Replicate Models
    logger.info('Parsing Replicate models.')
    const parsedReplicateProvider = config.model_providers.replicate satisfies ParsedModelProvider
    const parsedReplicateModels: { [key: string]: ParsedModel } = {}

    const capitalize = (str: string) => str.replace(/(?:^|\s|["'([{])+\S/g, (match) => match.toUpperCase())

    for (const replicateModel of replicateModels) {
      if (!parsedReplicateModels[replicateModel.owner]) {
        let owner = replicateModel.owner

        if (owner === 'stability-ai') {
          owner = 'stable-diffusion'
        }
        if (owner === 'black-forest-labs') {
          owner = 'flux'
        }
        if (owner === 'google') {
          owner = 'veo'
        }

        parsedReplicateModels[replicateModel.owner] = {
          id: owner,
          label: capitalize(owner.replace(/-/g, ' ')).replace(/[aA][iI]$/g, 'AI'),
          prefix: `${owner}/`,
          providers: [parsedReplicateProvider],
          provider_id: parsedReplicateProvider.id,
          features: [],
          children: [],
          created_at: new Date()
        }
      }

      parsedReplicateModels[replicateModel.owner].children?.push({
        id: `${replicateModel.name.replace(/ /g, '-').toLowerCase()}`,
        label: replicateModel.name,
        prefix: `${replicateModel.owner}/`,
        providers: [parsedReplicateProvider],
        provider_id: parsedReplicateProvider.id,
        features: replicateModel.features,
        pricing: !isVeo({ id: `${replicateModel.name.replace(/ /g, '-').toLowerCase()}` })
          ? {
              per_image: 40_000,
              discount: 1
            }
          : {
              per_second: 300_000,
              discount: 1
            },
        created_at: new Date(replicateModel.created_at)
      })
    }
    for (const parentReplicateModel of Object.values(parsedReplicateModels)) {
      if (parentReplicateModel.children?.length === 1 && !isStableDiffusion(parentReplicateModel) && !isVeo(parentReplicateModel)) {
        if (!parsedReplicateModels['replicate-other']) {
          parsedReplicateModels['replicate-other'] = {
            id: 'replicate-other',
            label: 'Replicate other',
            prefix: 'replicate-other/',
            providers: [parsedReplicateProvider],
            provider_id: parsedReplicateProvider.id,
            features: [],
            children: [],
            pricing: {
              per_image: 40_000,
              discount: 1
            },
            created_at: new Date()
          }
        }

        parsedReplicateModels['replicate-other'].children?.push(parentReplicateModel)
        delete parsedReplicateModels[parentReplicateModel.id]
      }
    }
    for (const parsedReplicateModel of Object.values(parsedReplicateModels)) {
      parsedModels.push(parsedReplicateModel)
    }
    logger.info('Parsed Replicate models.')

    logger.info('Parsing gpt4free models.')
    const parsedG4FProvider = {
      ...config.model_providers.g4f,
      fallback: parsedOpenRouterProvider,
      children: g4fProviders.map((provider) => ({
        ...provider,
        id: `${config.model_providers.g4f.id}-${provider.id.replace(/ /g, '-').toLowerCase()}`
      }))
    } satisfies ParsedModelProvider

    for (const g4fModel of g4fModels) {
      let parsedModel: ParsedModel | undefined = parsedModels.find((parsedModel) => {
        if (!parsedModel.children) return false

        return parsedModel.children.some(({ id }) => id === g4fModel.id)
      })

      const features: string[] = ['TEXT_TO_TEXT', 'DOCUMENT_TO_TEXT']

      if (!parsedModel) {
        parsedModels.push(
          (parsedModel = {
            id: g4fModel.id,
            pricing: {
              input: 1,
              input_image: 1,
              output: 1,
              discount: 1
            },
            context_length: 4095,
            max_tokens: 4096,
            features,
            providers: [parsedG4FProvider]
          })
        )
      } else if (parsedModel.children && !isStableDiffusion(parsedModel)) {
        const parsedChildModel: ParsedModel | undefined = parsedModel.children.find(({ id }) => id === g4fModel.id)

        if (!parsedChildModel) continue

        if (!parsedChildModel.providers) parsedChildModel.providers = []

        if (!parsedChildModel.features) parsedChildModel.features = features
        else parsedChildModel.features = [...new Set([...(parsedChildModel.features ?? []), ...features])]

        parsedChildModel.providers.unshift(parsedG4FProvider)
        if (!parsedModel.providers?.some(({ id }) => id === parsedG4FProvider.id)) {
          parsedModel.providers?.push(parsedG4FProvider)
        }
      }
    }
    logger.info('Parsed gpt4free models.')

    // Parse AssemblyAi Models
    logger.info('Parsing AssemblyAi models.')
    const parsedAssemblyAiProvider = {
      id: 'assembly-ai',
      label: 'AssemblyAi',
      name: 'AssemblyAi'
    } satisfies ParsedModelProvider
    const parsedAssemblyAiModel = {
      id: 'assembly-ai',
      label: 'AssemblyAI',
      features: ['AUDIO_TO_TEXT'],
      providers: [parsedAssemblyAiProvider],
      children: [
        {
          id: 'assembly-ai-nano',
          label: 'AssemblyAI-nano',
          pricing: {
            input: 2000,
            discount: 1
          },
          providers: [parsedAssemblyAiProvider],
          features: ['AUDIO_TO_TEXT']
        },
        {
          id: 'assembly-ai-best',
          label: 'AssemblyAI-best',
          pricing: {
            input: 5500,
            discount: 1
          },
          providers: [parsedAssemblyAiProvider],
          features: ['AUDIO_TO_TEXT']
        }
      ]
    } satisfies ParsedModel

    logger.info('Parsed AssemblyAi models.')
    parsedModels.push(parsedAssemblyAiModel)

    // Parse Runway Models
    logger.info('Parsing Runway models.')
    const parsedRunwayProvider = {
      id: 'runway',
      label: 'Runway',
      name: 'Runway'
    } satisfies ParsedModelProvider
    const parsedRunwayModel = {
      id: 'runway',
      label: 'Runway',
      features: ['IMAGE_TO_VIDEO', 'TEXT_TO_VIDEO'],
      providers: [parsedRunwayProvider],
      children: [
        {
          id: 'gen3a_turbo',
          label: 'Gen3A-turbo',
          pricing: {
            per_second: 150_000,
            discount: 1
          },
          providers: [parsedRunwayProvider],
          features: ['IMAGE_TO_VIDEO', 'TEXT_TO_VIDEO']
        },
        {
          id: 'gen4_turbo',
          label: 'Gen4-turbo',
          pricing: {
            per_second: 150_000,
            discount: 1
          },
          providers: [parsedRunwayProvider],
          features: ['IMAGE_TO_VIDEO', 'TEXT_TO_VIDEO']
        }
      ]
    } satisfies ParsedModel

    logger.info('Parsed Runway models.')
    parsedModels.push(parsedRunwayModel)

    // Other models
    logger.info('Processing other models.')
    const parsedOther = {
      id: 'other',
      label: 'Other',
      features: ['TEXT_TO_TEXT', 'DOCUMENT_TO_TEXT'],
      children: [] as ParsedModel[]
    } satisfies ParsedModel

    parsedModels = parsedModels.filter((parsedModel) => {
      if (isMidjourney(parsedModel)) {
        return true
      }
      if (isStableDiffusion(parsedModel)) {
        return true
      }
      if (!parsedModel.children || parsedModel.children.length === 0) {
        parsedOther.children.push(parsedModel)
      } else if (parsedModel.children.length === 1) {
        parsedOther.children.push(...parsedModel.children)
      }

      return parsedModel.children && parsedModel.children.length > 1
    })

    if (parsedOther.children.length > 0) {
      parsedModels.push(parsedOther)
    }

    // Models Customization
    logger.info('Applying model customizations.')
    const parsedAllChildModels = [
      ...new Set(
        parsedModels
          .map((parsedModel) => {
            if (!parsedModel.children) {
              return []
            }

            return parsedModel.children
          })
          .flat()
      )
    ]
    const modelCustomization = await modelCustomRepository.list({
      orderBy: {
        order: 'asc'
      }
    })

    for (const modelCustom of modelCustomization) {
      if (modelCustom.disabled) {
        continue
      }

      const modelId: string | null = modelCustom.model_id
      let modelIdRegexp: RegExp | null
      if (modelId && /^\^(.*)\$$/g.test(modelId)) {
        modelIdRegexp = new RegExp(modelId)
      } else {
        modelIdRegexp = null
      }

      const childModelId: string | null = modelCustom.child_model_id
      let childModelIdRegexp: RegExp | null
      if (childModelId && /^\^(.*)\$$/g.test(childModelId)) {
        childModelIdRegexp = new RegExp(childModelId)
      } else {
        childModelIdRegexp = null
      }

      const parsedFoundModels: ParsedModel[] = parsedModels.filter(({ id }) => (modelIdRegexp ? modelIdRegexp.test(id) : id === modelId))
      let parsedFoundModel: ParsedModel | null = parsedFoundModels[0] ?? null

      if (modelCustom.action === ModelCustomAction.INCLUDE && modelId) {
        if (!parsedFoundModel) {
          parsedFoundModel = {
            id: modelId,
            custom: true,
            children: []
          }
          parsedModels.push(parsedFoundModel)
        } else {
          parsedFoundModel.custom = true
        }

        // Include child models
        if (childModelId && parsedFoundModel.children) {
          const parsedFoundChildModels: ParsedModel[] = parsedAllChildModels.filter(({ id }) =>
            childModelIdRegexp ? childModelIdRegexp.test(id) : id === childModelId
          )

          for (const parsedFoundChildModel of parsedFoundChildModels) {
            parsedFoundChildModel.custom = true

            if (modelCustom.icon_id) {
              parsedFoundChildModel.icon_id = modelCustom.icon_id
            }
            if (modelCustom.provider_id) {
              parsedFoundChildModel.provider_id = modelCustom.provider_id
            }
            if (modelCustom.child_model_id) {
              parsedFoundChildModel.child_provider_id = modelCustom.child_provider_id
            }
            if (modelCustom.message_color) {
              parsedFoundChildModel.message_color = modelCustom.message_color
            }
            if (modelCustom.discount) {
              parsedFoundChildModel.discount = modelCustom.discount
            }
          }

          parsedFoundModel.children.push(...parsedFoundChildModels)
          // Include model
        } else {
          parsedFoundModel.custom = true

          if (modelCustom.label) {
            parsedFoundModel.label = modelCustom.label
          }
          if (modelCustom.icon_id) {
            parsedFoundModel.icon_id = modelCustom.icon_id
          }
          if (modelCustom.message_color) {
            parsedFoundModel.message_color = modelCustom.message_color
          }
          if (modelCustom.discount) {
            parsedFoundModel.discount = modelCustom.discount
          }
        }
      } else if (modelCustom.action === ModelCustomAction.EXCLUDE) {
        // Exclude child models
        if (childModelId) {
          for (const parsedFoundModel of parsedFoundModels) {
            if (!parsedFoundModel.children) {
              continue
            }

            parsedFoundModel.children = parsedFoundModel.children.filter(({ id }) =>
              childModelIdRegexp ? !childModelIdRegexp.test(id) : id !== childModelId
            )
          }
          // Exclude models
        } else if (modelId) {
          parsedModels = parsedModels.filter(({ id }) => (modelIdRegexp ? !modelIdRegexp.test(id) : id !== modelId))
        }
      }
    }
    logger.info('Applied model customizations.')

    // Parent Models Features
    logger.info('Determining parent models features.')
    for (const parsedModel of parsedModels) {
      if (parsedModel === parsedOpenAI) {
        continue
      }

      const parsedFirstChildModel: ParsedModel | null = parsedModel.children?.[0] ?? null

      if (!parsedModel.children || !parsedFirstChildModel || !parsedFirstChildModel.features) {
        continue
      }

      const parsedChildModels: ParsedModel[] = parsedModel.children
      const features: string[] = parsedFirstChildModel.features.filter((parentModelFeature) =>
        parsedChildModels.every(({ features = [] }) => features.some((feature) => feature === parentModelFeature))
      )

      parsedModel.features = features
    }

    // Models Orders
    logger.info('Assigning model orders.')
    for (let index = 0; index < parsedModels.length; index++) {
      const parsedModel = parsedModels[index]

      parsedModel.order = index + 1
      for (let childIndex = 0; parsedModel.children && childIndex < parsedModel.children.length; childIndex++) {
        const parsedChildModel = parsedModel.children[childIndex]

        parsedChildModel.order = childIndex + 1
      }
    }

    // Providers
    logger.info('Upserting model providers.')
    const parsedProviders: ParsedModelProvider[] = [
      parsedOpenRouterProvider,
      parsedOpenAIProvider,
      parsedImagineProProvider,
      parsedMidjourneyProvider,
      parsedReplicateProvider,
      parsedG4FProvider,
      parsedAssemblyAiProvider,
      parsedRunwayProvider
    ]

    // Upsert Providers
    const getProviderUpsertArgs = (
      parsedProvider: ParsedModelProvider,
      index: number,
      parsedParentProvider?: ParsedModelProvider
    ): Prisma.ModelProviderUpsertArgs => {
      return {
        where: {
          id: parsedProvider.id
        },
        create: {
          id: parsedProvider.id,
          name: parsedProvider.name,
          label: parsedProvider.label,
          order: index + 1,
          ...(parsedParentProvider && {
            parent_id: parsedParentProvider.id
          }),
          ...('supported_accounts' in parsedProvider &&
            typeof parsedProvider.supported_accounts === 'boolean' && {
              supported_accounts: parsedProvider.supported_accounts
            }),
          ...('supported_account_queue_types' in parsedProvider &&
            Array.isArray(parsedProvider.supported_account_queue_types) && {
              supported_account_queue_types: parsedProvider.supported_account_queue_types
            })
        },
        update: {
          name: parsedProvider.name,
          ...(parsedParentProvider && {
            parent_id: parsedParentProvider.id
          }),
          ...('supported_accounts' in parsedProvider &&
            typeof parsedProvider.supported_accounts === 'boolean' && {
              supported_accounts: parsedProvider.supported_accounts
            }),
          ...('supported_account_queue_types' in parsedProvider &&
            Array.isArray(parsedProvider.supported_account_queue_types) && {
              supported_account_queue_types: parsedProvider.supported_account_queue_types
            })
        }
      }
    }

    const providerCount = await modelProviderRepository.count()

    await Promise.all(
      parsedProviders.map((parsedProvider, index) => modelProviderRepository.upsert(getProviderUpsertArgs(parsedProvider, index)))
    )
    if (providerCount === 0) {
      await Promise.all(
        parsedProviders.map(
          (parsedProvider) =>
            parsedProvider.fallback &&
            modelProviderRepository.update({
              where: {
                id: parsedProvider.id
              },
              data: {
                fallback: {
                  connect: {
                    id: parsedProvider.fallback.id
                  }
                }
              }
            })
        )
      )
    }
    await Promise.all(
      parsedProviders.map(
        (parsedProvider) =>
          parsedProvider.children &&
          Promise.all(
            parsedProvider.children.map((parsedChildProvider, index) =>
              modelProviderRepository.upsert(getProviderUpsertArgs(parsedChildProvider, index, parsedProvider))
            )
          )
      )
    )

    // Upsert Models
    logger.info('Upserting models.')
    const modelCount = await modelRepository.count()

    const getModelUpsertArgs = (parsedModel: ParsedModel, parsedParentModel?: ParsedModel): Prisma.ModelUpsertArgs => ({
      where: {
        id: parsedModel.id,
        deleted_at: undefined
      },
      create: {
        id: parsedModel.id,
        label: parsedModel.label ?? parsedModel.id,
        pricing: parsedModel.pricing,
        prefix: parsedModel.prefix,
        ...(parsedModel.context_length && {
          context_length: parsedModel.context_length
        }),
        ...(parsedModel.max_tokens && {
          max_tokens: parsedModel.max_tokens
        }),
        features: parsedModel.features,
        ...(parsedModel.functions && {
          functions: {
            createMany: {
              data: parsedModel.functions.map((parsedModelFunction) => ({
                id: parsedModelFunction.id,
                name: parsedModelFunction.name,
                label: parsedModelFunction.label,
                is_default: parsedModelFunction.is_default,
                features: parsedModelFunction.features
              }))
            }
          }
        }),
        ...(parsedModel.providers && {
          providers: {
            connect: parsedModel.providers.map(({ id }) => ({ id }))
          }
        }),
        ...(parsedParentModel && {
          parent_id: parsedParentModel.id
        }),
        provider_id: parsedModel.provider_id,
        child_provider_id: parsedModel.child_provider_id,
        order: parsedModel.order,
        custom: parsedModel.custom ?? false,
        owned_by: parsedParentModel ? parsedParentModel.id : parsedModel.id,
        created_at: parsedModel.created_at,
        ...(parsedModel.custom && {
          icon_id: parsedModel.icon_id ?? null,
          ...(parsedModel.message_color && {
            message_color: parsedModel.message_color
          })
        }),
        ...(!parsedModel.custom && {
          icon_id: null,
          message_color: null
        }),
        deleted_at: null,
        disabled: true,
        disabledWeb: true,
        disabledTelegram: true,
      },
      update: {
        ...(parsedModel.providers && {
          providers: {
            connect: parsedModel.providers.map(({ id }) => ({ id }))
          }
        }),
        ...(parsedParentModel && {
          parent_id: parsedParentModel.id
        }),
        ...(parsedModel.custom && {
          icon_id: parsedModel.icon_id ?? null,
          ...(parsedModel.label && {
            label: parsedModel.label
          }),
          ...(parsedModel.provider_id && {
            provider_id: parsedModel.provider_id,
            child_provider_id: null
          }),
          ...(parsedModel.child_provider_id && {
            child_provider_id: parsedModel.child_provider_id
          }),
          ...(parsedModel.message_color && {
            message_color: parsedModel.message_color
          })
        }),
        ...(!parsedModel.custom && {
          icon_id: null,
          message_color: null
        }),
        custom: parsedModel.custom ?? false,
        deleted_at: null,
      }
    })

    const notifyNewModels = async (parsedModels: ParsedModel[]) => {
      const filteredParsedModels = parsedModels.filter((parsedModel) => !parsedModel.custom)

      if (filteredParsedModels.length === 0) {
        return
      }

      try {
        await tgNotificationBotGateway.send(
          filteredParsedModels
            .map(
              (parsedModel) =>
                `A new model <b>${parsedModel.prefix ? parsedModel.prefix : ''}${parsedModel.id}</b>${parsedModel.providers && parsedModel.providers.length > 0 ? ` from provider <b>${parsedModel.providers[0].label ?? parsedModel.providers[0].name ?? parsedModel.providers[0].id}</b>` : ''} has been released!\nEnable it in the <a href=${JSON.stringify(config.frontend.address + 'admin')}>admin panel</a> now.`
            )
            .join('\n\n'),
          TgBotParseMode.HTML
        )
      } catch (error) {
        logger.error(error)
      }
    }

    const parsedNewModels: ParsedModel[] = []

    const upsertModel = async (parsedModel: ParsedModel, parsedParentModel?: ParsedModel) => {
      try {
        const { where, create, update } = getModelUpsertArgs(parsedModel, parsedParentModel)
        const model = await modelRepository.get({
          where
        })

        if (model) {
          await modelRepository.update({
            where,
            data: {
              ...update,
              ...(model.auto_update_pricing &&
                parsedModel.pricing && {
                  pricing: parsedModel.pricing
                }),
              ...(typeof model.pricing === 'object' &&
                parsedModel.discount && {
                  pricing: {
                    ...(model.auto_update_pricing && parsedModel.pricing ? { ...parsedModel.pricing } : { ...model.pricing }),
                    discount: parsedModel.discount
                  }
                })
            }
          })
        } else {
          parsedNewModels.push(parsedModel)

          await modelRepository.create({
            data: create
          })
          logger.info(`Created new model ${parsedModel.id}.`)
        }
      } catch (error) {
        logger.error(`Error upserting model ${parsedModel.id}:`, error)
        throw error
      }
    }

    await Promise.all(parsedModels.map((parsedModel) => upsertModel(parsedModel)))
    await Promise.all(
      parsedModels
        .filter((parsedModel) => !parsedModel.custom)
        .map(
          (parsedModel) =>
            parsedModel.children &&
            Promise.all(
              parsedModel.children
                .filter((parsedChildModel) => !parsedChildModel.custom)
                .map((parsedChildModel) => upsertModel(parsedChildModel, parsedModel))
            )
        )
    )
    await Promise.all(
      parsedModels
        .filter((parsedModel) => !!parsedModel.custom)
        .map(
          (parsedModel) =>
            parsedModel.children &&
            Promise.all(
              parsedModel.children
                .filter((parsedChildModel) => !!parsedChildModel.custom)
                .map((parsedChildModel) => upsertModel(parsedChildModel, parsedModel))
            )
        )
    )

    if (modelCount > 0) {
      await notifyNewModels(parsedNewModels)
    }

    // Delete Models
    logger.info('Deleting old models.')
    const parsedAllModelsIds: string[] = parsedModels.flatMap((parsedModel) => [
      parsedModel.id,
      ...(parsedModel.children?.map(({ id }) => id) || [])
    ])

    const modelDeleteResult = await modelRepository.updateMany({
      where: {
        id: { notIn: parsedAllModelsIds },
        deleted_at: null
      },
      data: { deleted_at: new Date() }
    })

    await planModelRepository.updateMany({
      where: {
        model_id: { notIn: parsedAllModelsIds },
        deleted_at: null
      },
      data: {
        deleted_at: new Date()
      }
    })
    logger.info(`Deleted ${modelDeleteResult.count} old models.`)
    logger.info('Model parsing completed.')

    return parsedModels
  }
