import { ChatCompletionChunk } from 'openai/resources'
import { catchError, concatMap, from, map, Observable, of, switchMap } from 'rxjs'
import { Stream } from 'openai/streaming'
import { PlanType } from '@prisma/client'
import { config, devMode } from '@/config'
import { logger } from '@/lib/logger'
import { getErrorString } from '@/lib'
import { TgBotParseMode } from '@/lib/clients/tg-bot'
import { Adapter } from '@/domain/types'
import { BaseError, ForbiddenError, NotFoundError } from '@/domain/errors'
import { IMessage } from '@/domain/entity/message'
import { IChatTextSettings } from '@/domain/entity/chatSettings'
import { IModelProvider, isG4FProvider, isOpenAIProvider, isOpenRouterProvider } from '@/domain/entity/modelProvider'
import { IModel } from '@/domain/entity/model'
import { IModelAccount } from '@/domain/entity/modelAccount'
import { IUser } from '@/domain/entity/user'
import { IModelAccountModel } from '@/domain/entity/modelAccountModel'
import { ChatService } from '@/domain/service/chat'
import { JobService } from '@/domain/service/job'
import { SubscriptionService } from '@/domain/service/subscription'
import { UserService } from '@/domain/service/user'
import { ModelService } from '@/domain/service/model'

type Params = Adapter & {
  chatService: ChatService
  jobService: JobService
  subscriptionService: SubscriptionService
  userService: UserService
  modelService: ModelService
}

export interface TextChunk {
  status: 'pending' | 'done'
  value: string
  reasoningValue: string | null
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  } | null
  provider?: IModelProvider | null
  childProvider?: IModelProvider | null
}

export type TextObservable = {
  stream: Stream<ChatCompletionChunk>
  provider?: IModelProvider | null
  childProvider?: IModelProvider | null
} & Observable<TextChunk>

export type SendTextByProvider = (params: {
  providerId: string | null
  childProviderId?: string | null
  model: IModel
  messages: Array<IMessage>
  settings: Partial<IChatTextSettings> & {
    system_prompt: string
  }
  user: Pick<IUser, 'id'> & Partial<Pick<IUser, 'email'>>
  textMessageId?: string
  planType: PlanType | null
}) => Promise<TextObservable>

export type SendTextByFallbackProvider = (params: {
  provider: IModelProvider
  childProvider: IModelProvider | null
  error: unknown
  model: IModel
  modelAccount: IModelAccount | null
  modelAccountModel: IModelAccountModel | null
  messages: Array<IMessage>
  settings: Partial<IChatTextSettings> & {
    system_prompt: string
  }
  user: Pick<IUser, 'id'> & Partial<Pick<IUser, 'email'>>
  textMessageId?: string
  planType: PlanType | null
}) => Promise<TextObservable>

export const buildSendTextByProvider = ({
  gptGateway,
  openrouterGateway,
  g4fGateway,
  modelProviderRepository,
  modelService,
  tgNotificationBotGateway
}: Params) => {
  const sendByProvider: SendTextByProvider = async ({ providerId, childProviderId = null, model, user, planType, ...params }) => {
    if (!providerId) {
      const defaultProvider = await modelService.getDefaultProvider({
        model
      })

      if (!defaultProvider) {
        throw new NotFoundError({
          code: 'DEFAULT_MODEL_PROVIDER_NOT_FOUND',
          message: `Default model provider not found for model ${model.id}`
        })
      }

      providerId = defaultProvider.id
    }

    const provider = await modelProviderRepository.get({
      where: {
        id: providerId,
        models: {
          some: {
            id: model.id
          }
        }
      },
      orderBy: {
        order: 'asc'
      },
      include: {
        fallback: {
          select: {
            id: true,
            name: true,
            disabled: true
          }
        }
      }
    })

    if (!provider) {
      throw new NotFoundError({
        code: 'MODEL_PROVIDER_NOT_FOUND'
      })
    }

    if (provider.disabled && provider.fallback_id) {
      return sendByProvider({
        providerId: provider.fallback_id,
        childProviderId: null,
        model,
        user,
        planType,
        ...params
      })
    }
    if (provider.disabled) {
      throw new ForbiddenError({
        code: 'MODEL_PROVIDER_DISABLED'
      })
    }

    let childProvider: IModelProvider | null = null

    if (childProviderId || model.child_provider_id) {
      childProvider = await modelProviderRepository.get({
        where: {
          ...(model.child_provider_id && {
            id: model.child_provider_id
          }),
          ...(childProviderId && {
            id: childProviderId
          }),
          parent_id: providerId
        }
      })
    }

    let text$: TextObservable
    let g4fAccount: IModelAccount | null = null
    let g4fAccountModel: IModelAccountModel | null = null

    try {
      const supportsImages = model.features?.some((feature) => feature === 'IMAGE_TO_TEXT')

      if (isOpenAIProvider(provider)) {
        text$ = await gptGateway.send({
          ...params,
          settings: {
            ...params.settings,
            model: model.id
          },
          supportsImages,
          endUserId: user.id
        })
      } else if (isOpenRouterProvider(provider)) {
        text$ = await openrouterGateway.send({
          ...params,
          settings: {
            ...params.settings,
            model: model.prefix + model.id
          },
          ...(childProvider &&
            childProvider.name && {
              provider: {
                order: [childProvider.name]
              }
            }),
          supportsImages,
          endUserId: user.id
        })
      } else if (isG4FProvider(provider)) {
        const activeAccountAndModel = await modelService.accountBalancer.g4f.balanceGeneration({
          childProvider,
          model_id: model.id
        })
        g4fAccount = activeAccountAndModel?.g4fActiveAccount ?? null
        g4fAccountModel = activeAccountAndModel?.g4fAccountModel ?? null

        let apiUrl: string
        if (g4fAccount && g4fAccount.g4f_api_url) {
          apiUrl = g4fAccount.g4f_api_url
        } else {
          apiUrl = config.model_providers.g4f.api_url
        }

        text$ = await g4fGateway.send({
          ...params,
          apiUrl,
          settings: {
            ...params.settings,
            model: model.id
          },
          ...(childProvider &&
            childProvider.name && {
              provider: childProvider.name
            }),
          endUserId: user.id
        })
      } else {
        throw new ForbiddenError({
          code: 'MODEL_PROVIDER_NOT_SUPPORTED'
        })
      }
    } catch (error) {
      return sendByFallbackProviderOrThrow({
        provider,
        childProvider,
        error,
        model,
        user,
        planType,
        modelAccount: g4fAccount,
        modelAccountModel: g4fAccountModel,
        ...params
      })
    }

    const { stream } = text$

    const textChunk: Pick<TextChunk, 'provider' | 'childProvider'> = {
      provider,
      childProvider
    }

    const generationStart = performance.now()

    text$ = text$.pipe(
      catchError((error) => {
        if (isG4FProvider(provider)) {
          modelService.accountBalancer.g4f
            .balance({
              g4fAccount,
              g4fAccountModel,
              generationStart,
              error
            })
            .catch((balanceError) => {
              logger.error('sendTextByProvider g4fbalance', balanceError)
            })
        }

        return from(
          sendByFallbackProviderOrThrow({
            provider,
            childProvider,
            error,
            model,
            user,
            planType,
            modelAccount: g4fAccount,
            modelAccountModel: g4fAccountModel,
            ...params
          })
        ).pipe(
          switchMap((value) => {
            if (value instanceof Observable) {
              textChunk.provider = value.provider
              textChunk.childProvider = value.childProvider

              return value
            }

            return of(value)
          }),
          map((chunk) => ({
            ...chunk,
            ...textChunk
          }))
        )
      }),
      concatMap(async (chunk) => {
        if (chunk.status === 'done' && textChunk.childProvider && isG4FProvider(textChunk.childProvider) && g4fAccount) {
          if (config.model_providers.g4f.logs) {
            logger.info({
              message: 'gpt4free successfully generated',
              model: model.id,
              g4fProvider: textChunk.childProvider.name,
              g4fAccount: g4fAccount.name,
              g4fMessageId: params.textMessageId,
              user: user.email ?? user.id
            })
          }

          modelService.accountBalancer.g4f
            .balance({
              g4fAccount,
              g4fAccountModel,
              generationStart
            })
            .catch((balanceError) => {
              logger.error('sendTextByProvider g4fbalance', balanceError)
            })
        }

        return {
          ...chunk,
          ...textChunk
        }
      })
    ) as TextObservable

    text$.stream = stream
    text$.provider = provider
    text$.childProvider = childProvider

    return text$
  }

  const sendByFallbackProviderOrThrow = buildSendByFallbackProviderOrThrow({
    sendByProvider,
    tgNotificationBotGateway
  })

  return sendByProvider
}

const buildSendByFallbackProviderOrThrow = ({
  sendByProvider,
  tgNotificationBotGateway
}: {
  sendByProvider: SendTextByProvider
  tgNotificationBotGateway: Adapter['tgNotificationBotGateway']
}): SendTextByFallbackProvider => {
  return async ({ provider, childProvider, model, modelAccount, modelAccountModel, error, messages, user, ...params }) => {
    if (error instanceof BaseError && (error.code === 'CONTEXT_LENGTH_EXCEEDED' || error.code === 'MESSAGE_TOO_LONG')) {
      throw error
    }

    if (typeof error === 'object' && isG4FProvider(provider) && !devMode && modelAccount) {
      if (error instanceof BaseError && (error.code === 'G4F_VISION_NOT_SUPPORTED' || error.code === 'G4F_NO_ACTIVE_ACCOUNTS')) {
        // ignore these errors
      } else {
        tgNotificationBotGateway.send(
          `Ошибка G4F: \n${JSON.stringify({
            error: getErrorString(error),
            g4fAccount: modelAccount?.name,
            g4fAccountModel: modelAccountModel?.model_id,
            childProvider: childProvider?.name,
            model: model.id
          })}`,
          TgBotParseMode.HTML
        )
      }
    }

    const lastUserMessage = getLastUserMessage(messages)

    const logEntry = {
      message: getErrorString(error),
      provider: provider.name,
      model: model.id,
      ...(modelAccount && {
        modelAccount: modelAccount.name
      }),
      providerFallback: provider.fallback?.name ?? null,
      ...(lastUserMessage && {
        lastUserMessageId: lastUserMessage.id
      }),
      user: user.email ?? user.id
    }

    if (provider.fallback && !provider.fallback.disabled) {
      logger.warn('sendByFallbackProviderOrThrow', logEntry)

      try {
        return await sendByProvider({
          providerId: provider.fallback_id,
          childProviderId: null,
          model,
          messages,
          user,
          ...params
        })
      } catch (e) {
        logger.error(`sendByFallbackProviderOrThrow[text] Fallback provider ${provider.fallback_id} failed to send message`, {
          error: getErrorString(e)
        })

        throw error
      }
    }

    logger.error('sendByFallbackProviderOrThrow', logEntry)

    throw error
  }
}

function getLastUserMessage(messages: IMessage[]) {
  for (let i = messages.length - 1; i >= 0; i--) {
    const message = messages[i]
    if (message.role === 'user' && !message.disabled) {
      return message
    }
  }
  return null
}
