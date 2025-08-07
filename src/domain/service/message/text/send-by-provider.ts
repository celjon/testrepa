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
import { IChatTextSettings } from '@/domain/entity/chat-settings'
import {
  IModelProvider,
  isG4FProvider,
  isOpenAIProvider,
  isOpenRouterProvider,
} from '@/domain/entity/model-provider'
import { IModel } from '@/domain/entity/model'
import { IModelAccount } from '@/domain/entity/model-account'
import { IUser } from '@/domain/entity/user'
import { IModelAccountModel } from '@/domain/entity/model-account-model'
import { ChatService } from '@/domain/service/chat'
import { JobService } from '@/domain/service/job'
import { SubscriptionService } from '@/domain/service/subscription'
import { UserService } from '@/domain/service/user'
import { ModelService } from '@/domain/service/model'
import { ActiveG4FAccount } from '@/domain/service/model/account-balancer/g4f/balance-generation'

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
  g4f_account_id?: string
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
  tgNotificationBotGateway,
}: Params) => {
  const sendByProvider: SendTextByProvider = async ({
    providerId,
    childProviderId = null,
    model,
    user,
    planType,
    ...params
  }) => {
    if (!providerId) {
      const defaultProvider = await modelService.getDefaultProvider({
        model,
      })

      if (!defaultProvider) {
        throw new NotFoundError({
          code: 'DEFAULT_MODEL_PROVIDER_NOT_FOUND',
          message: `Default model provider not found for model ${model.id}`,
        })
      }

      providerId = defaultProvider.id
    }

    const provider = await modelProviderRepository.get({
      where: {
        id: providerId,
        models: {
          some: {
            id: model.id,
          },
        },
      },
      orderBy: {
        order: 'asc',
      },
      include: {
        fallback: {
          select: {
            id: true,
            name: true,
            disabled: true,
          },
        },
      },
    })

    if (!provider) {
      throw new NotFoundError({
        code: 'MODEL_PROVIDER_NOT_FOUND',
      })
    }

    if (provider.disabled && provider.fallback_id) {
      return sendByProvider({
        providerId: provider.fallback_id,
        childProviderId: null,
        model,
        user,
        planType,
        ...params,
      })
    }
    if (provider.disabled) {
      throw new ForbiddenError({
        code: 'MODEL_PROVIDER_DISABLED',
      })
    }

    let childProvider: IModelProvider | null = null

    if (childProviderId || model.child_provider_id) {
      childProvider = await modelProviderRepository.get({
        where: {
          ...(model.child_provider_id && {
            id: model.child_provider_id,
          }),
          ...(childProviderId && {
            id: childProviderId,
          }),
          parent_id: providerId,
        },
      })
    }

    let text$: TextObservable
    let g4fAccount: ActiveG4FAccount | null = null
    let g4fAccountModel: IModelAccountModel | null = null
    let g4fRequestId: string | null = null

    try {
      const supportsImages = model.features?.some((feature) => feature === 'IMAGE_TO_TEXT')

      const hasImages = params.messages.some(
        (message) => message.role === 'user' && message.images && message.images.length > 0,
      )

      if (isOpenAIProvider(provider)) {
        text$ = await gptGateway.send({
          ...params,
          settings: {
            ...params.settings,
            model: model.id,
          },
          supportsImages,
          endUserId: user.id,
        })
      } else if (isOpenRouterProvider(provider)) {
        const notLargeContext =
          (await modelService.tokenize({
            model,
            messages: params.messages,
          })) <
          model.context_length * 1.5

        text$ = await openrouterGateway.send({
          ...params,
          settings: {
            ...params.settings,
            model: model.prefix + model.id,
          },
          ...(childProvider &&
            childProvider.name && {
              provider: {
                order: [childProvider.name],
              },
            }),
          supportsImages,
          endUserId: user.id,
          middleOut: notLargeContext,
        })
      } else if (isG4FProvider(provider) && !hasImages) {
        const activeAccountAndModel = await modelService.accountBalancer.g4f.balanceGeneration({
          childProvider,
          model_id: model.id,
        })
        g4fAccount = activeAccountAndModel.account
        g4fAccountModel = activeAccountAndModel.accountModel
        g4fRequestId = activeAccountAndModel.requestId

        text$ = await g4fGateway.send({
          ...params,
          apiUrl: g4fAccount.g4f_api_url,
          settings: {
            ...params.settings,
            model: model.id,
          },
          ...(childProvider &&
            childProvider.name && {
              provider: childProvider.name,
            }),
          endUserId: user.id,
        })
      } else {
        throw new ForbiddenError({
          code: 'MODEL_PROVIDER_NOT_SUPPORTED',
        })
      }
    } catch (error) {
      if (isG4FProvider(provider)) {
        modelService.accountBalancer.g4f
          .balance({
            requestId: g4fRequestId,
            account: g4fAccount,
            accountModel: g4fAccountModel,
            generationStart: performance.now(),
            error: null,
          })
          .catch((balanceError) => {
            logger.error({
              location: 'sendTextByProvider[g4f.balance()]',
              message: `balancing after failing to get active account: ${getErrorString(balanceError)}`,
            })
          })
      }

      return sendByFallbackProviderOrThrow({
        provider,
        childProvider,
        error,
        model,
        user,
        planType,
        modelAccount: g4fAccount,
        modelAccountModel: g4fAccountModel,
        ...params,
      })
    }

    const { stream } = text$

    const textChunk: Pick<TextChunk, 'provider' | 'childProvider'> = {
      provider,
      childProvider,
    }

    const generationStart = performance.now()

    text$ = text$.pipe(
      catchError((error) => {
        if (isG4FProvider(provider)) {
          modelService.accountBalancer.g4f
            .balance({
              requestId: g4fRequestId,
              account: g4fAccount,
              accountModel: g4fAccountModel,
              generationStart,
              error,
            })
            .catch((balanceError) => {
              logger.error({
                location: 'sendTextByProvider[g4f.balance()]',
                message: `balancing after generation error: ${getErrorString(balanceError)}`,
              })
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
            ...params,
          }),
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
            ...textChunk,
          })),
        )
      }),
      concatMap(async (chunk) => {
        const isSuccessfullG4FGeneration =
          chunk.status === 'done' &&
          textChunk.childProvider &&
          isG4FProvider(textChunk.childProvider) &&
          g4fAccount

        if (isSuccessfullG4FGeneration) {
          if (config.model_providers.g4f.logs) {
            logger.info({
              message: 'gpt4free successfully generated',
              model: model.id,
              g4fProvider: textChunk?.childProvider?.name,
              g4fAccount: g4fAccount?.name,
              g4fMessageId: params.textMessageId,
              email: user.email,
              userId: user.id,
              generationTimeMs: (performance.now() - generationStart).toFixed(2),
            })
          }

          modelService.accountBalancer.g4f
            .balance({
              requestId: g4fRequestId,
              account: g4fAccount,
              accountModel: g4fAccountModel,
              generationStart,
            })
            .catch((balanceError) => {
              logger.error({
                location: 'sendTextByProvider[g4f.balance()]',
                message: `balancing after successfull generation: ${getErrorString(balanceError)}`,
              })
            })
        }

        return {
          ...chunk,
          ...textChunk,
          g4f_account_id: isSuccessfullG4FGeneration ? g4fAccount?.id : undefined,
        }
      }),
    ) as TextObservable

    text$.stream = stream
    text$.provider = provider
    text$.childProvider = childProvider

    return text$
  }

  const sendByFallbackProviderOrThrow = buildSendByFallbackProviderOrThrow({
    sendByProvider,
    tgNotificationBotGateway,
  })

  return sendByProvider
}

const buildSendByFallbackProviderOrThrow = ({
  sendByProvider,
  tgNotificationBotGateway,
}: {
  sendByProvider: SendTextByProvider
  tgNotificationBotGateway: Adapter['tgNotificationBotGateway']
}): SendTextByFallbackProvider => {
  return async ({
    provider,
    childProvider,
    model,
    modelAccount,
    modelAccountModel,
    error,
    messages,
    user,
    ...params
  }) => {
    if (
      error instanceof BaseError &&
      (error.code === 'CONTEXT_LENGTH_EXCEEDED' || error.code === 'MESSAGE_TOO_LONG')
    ) {
      throw error
    }

    if (typeof error === 'object' && isG4FProvider(provider) && !devMode && modelAccount) {
      if (
        !(error instanceof BaseError) ||
        (error.code !== 'G4F_NO_ACTIVE_ACCOUNTS' &&
          error.code !== 'G4F_NO_VALID_HAR_FILE' &&
          error.code !== 'G4F_NO_VALID_ACCESS_TOKEN' &&
          error.code !== 'G4F_REQUEST_TOO_LONG' &&
          error.code !== 'G4F_MODEL_USAGE_COUNT_EXCEEDED')
      ) {
        tgNotificationBotGateway.send(
          `Ошибка G4F: \n${JSON.stringify({
            error: getErrorString(error),
            g4fAccount: modelAccount?.name,
            g4fAccountModel: modelAccountModel?.model_id,
            childProvider: childProvider?.name,
            model: model.id,
          })}`,
          TgBotParseMode.HTML,
        )
      }
    }

    const lastUserMessage = getLastUserMessage(messages)

    const logEntry = {
      message: getErrorString(error),
      provider: provider.name,
      model: model.id,
      ...(modelAccount && {
        modelAccount: modelAccount.name,
      }),
      providerFallback: provider.fallback?.name ?? null,
      ...(lastUserMessage && {
        lastUserMessageId: lastUserMessage.id,
      }),
      user: user.email ?? user.id,
    }

    if (provider.fallback && !provider.fallback.disabled) {
      logger.warn({
        ...logEntry,
        location: 'sendByFallbackProviderOrThrow',
      })

      try {
        return await sendByProvider({
          providerId: provider.fallback_id,
          childProviderId: null,
          model,
          messages,
          user,
          ...params,
        })
      } catch (e) {
        logger.error({
          location: `sendByFallbackProviderOrThrow.fallbackFailed`,
          message: getErrorString(e),
          fallback_id: provider.fallback_id,
        })

        throw error
      }
    }

    logger.error({
      ...logEntry,
      location: 'sendByFallbackProviderOrThrow.noFallback',
    })

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
