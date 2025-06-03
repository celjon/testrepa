import { Adapter, ModelAccountRepository, ModelFunctionRepository, TgNotificationBotGateway } from '@/adapter'
import { config, devMode } from '@/config'
import { ModelAccountStatus } from '@prisma/client'
import { MidjourneyImagineResult } from '@/lib/clients/midjourney-api'
import { TgBotParseMode } from '@/lib/clients/tg-bot/types'
import { logger } from '@/lib/logger'
import { ModelService } from '../../model'
import { IMessage } from '@/domain/entity/message'
import { IChatMidjourneySettings } from '@/domain/entity/chatSettings'
import { DefineError, ErrorType } from './defineError'
import { IMessageImage } from '@/domain/entity/messageImage'
import { IModelAccount } from '@/domain/entity/modelAccount'
import { ForbiddenError } from '@/domain/errors'

type Params = Adapter & {
  modelService: ModelService
  defineError: DefineError
}

export type ProcessMjParams = {
  modelFunction: 'button' | 'imagine' | 'describe'
  message: IMessage & { content: string | null }
  settings?: IChatMidjourneySettings & { no: string }
  callback?: (params: { url?: string; progress: string }) => Promise<void>
  button?: { messageId: string; buttonCustom: string }
}

export type MjConfig = {
  accountId: string
  SalaiToken: string
  ServerId: string
  ChannelId: string
  PersonalizationKey?: string
}

export type ProcessMj = (params: {
  account: IModelAccount
  mjConfig: MjConfig
  imagineParams: ProcessMjParams
  url?: string
}) => Promise<(MidjourneyImagineResult & { accountId: string }) | null>

const updateAccountGenerations = async (modelAccountRepository: ModelAccountRepository, accountId: string, increment: boolean) => {
  await modelAccountRepository.update({
    where: { id: accountId },
    data: {
      mj_active_generations: increment ? { increment: 1 } : { decrement: 1 },
      ...(increment && { mj_used_count: { increment: 1 } })
    }
  })
}

const incrementModelFunctionUsage = async (modelFunctionRepository: ModelFunctionRepository, modelFunction: string) => {
  await modelFunctionRepository.update({
    where: { id: modelFunction },
    data: { used_count: { increment: 1 } }
  })
}

const buildErrorMessage = (errorMessage: string, imagineParams: ProcessMjParams): string => {
  const { message, modelFunction } = imagineParams
  return (
    `На <b>${devMode ? 'тестовом' : 'продовском'}</b> сервере\n` +
    (message.user?.tg_id ? `TgId пользователя: ${message.user.tg_id}\n` : '') +
    (message.user?.email ? `Email пользователя: ${message.user.email}\n` : '') +
    (modelFunction !== 'button' ? `Запрос: ${message.content}\n` : '') +
    `Метод: ${modelFunction}\n` +
    (message.images?.length ? `Ссылки: ${message.images.map((image: IMessageImage) => image.original?.path).join(',\n ')}\n` : '') +
    `ПРОВЕРЬТЕ <a href=${JSON.stringify(config.frontend.address + 'admin')}>АДМИН ПАНЕЛЬ</a>. \n\n` +
    `Ошибка: \n${errorMessage}`
  )
}

const handleErrorNotification = async (
  errorType: string,
  account: IModelAccount,
  errorMessage: string,
  imagineParams: ProcessMjParams,
  tgNotificationBotGateway: TgNotificationBotGateway
): Promise<ModelAccountStatus> => {
  let messageToSend = ''
  let status: ModelAccountStatus

  switch (errorType) {
    case ErrorType.PLAN_LIMIT_REACHED:
      messageToSend = `НА АККАУНТЕ <b>${account.name}</b>, ЗАКОНЧИЛАСЬ ПОДПИСКА.\n`
      status = ModelAccountStatus.RELAX
      break
    case ErrorType.USER_BLOCKED:
      messageToSend = `АККАУНТ <b>${account.name}</b> БЫЛ ЗАБЛОКИРОВАН.\n`
      status = ModelAccountStatus.BANNED
      break
    case ErrorType.INVALID_RESPONSE:
      messageToSend = `НЕВАЛИДНЫЙ ОТВЕТ ОТ API ДЛЯ АККАУНТА <b>${account.name}</b>.\n`
      status = ModelAccountStatus.INACTIVE
      break
    case ErrorType.TIMEOUT_EXCEEDED:
      messageToSend = `ТАЙМАУТ ПРЕВЫШЕН ДЛЯ АККАУНТА <b>${account.name}</b>.\n`
      status = ModelAccountStatus.INACTIVE
      break
    case 'MJ_7_ERROR':
      messageToSend = `ОШИБКА MJ_7_ERROR ДЛЯ АККАУНТА <b>${account.name}</b>.\n`
      status = ModelAccountStatus.INACTIVE
      break
    default:
      messageToSend = `НЕИЗВЕСТНАЯ ОШИБКА ДЛЯ АККАУНТА <b>${account.name}</b>.\n`
      status = ModelAccountStatus.INACTIVE
      break
  }

  messageToSend += buildErrorMessage(errorMessage, imagineParams)
  await tgNotificationBotGateway
    .send(messageToSend, TgBotParseMode.HTML)
    .catch((error) => logger.error('mj handleErrorNotification', error))

  return status
}

export const buildProcessMj = ({
  midjourneyGateway,
  modelAccountRepository,
  tgNotificationBotGateway,
  modelService,
  modelFunctionRepository,
  defineError
}: Params): ProcessMj => {
  const processMj = async ({
    account,
    mjConfig,
    imagineParams,
    url
  }: {
    account: IModelAccount
    mjConfig: MjConfig
    imagineParams: ProcessMjParams
    attempt?: number
    url?: string
  }): Promise<(MidjourneyImagineResult & { accountId: string }) | null> => {
    try {
      await updateAccountGenerations(modelAccountRepository, account.id, true)
      if (imagineParams.modelFunction !== 'button') {
        await incrementModelFunctionUsage(modelFunctionRepository, imagineParams.modelFunction)
      }

      let result: (MidjourneyImagineResult & { accountId: string }) | null = null
      if (imagineParams.modelFunction === 'imagine' && !url && imagineParams.callback && imagineParams.settings) {
        result = await midjourneyGateway.imagine({
          config: mjConfig,
          message: imagineParams.message,
          settings: imagineParams.settings,
          callback: imagineParams.callback
        })
      } else if (imagineParams.modelFunction === 'describe' && url) {
        const describeResult = await midjourneyGateway.describe({ config: mjConfig, url })
        result = describeResult
          ? {
              content: describeResult.content,
              url: '',
              flags: 0,
              accountId: account.id,
              id: ''
            }
          : null
      } else if (imagineParams.modelFunction === 'button' && imagineParams.button && imagineParams.callback) {
        result = await midjourneyGateway.button({
          config: mjConfig,
          messageId: imagineParams.button.messageId,
          button: imagineParams.button.buttonCustom,
          callback: imagineParams.callback
        })
      }

      await updateAccountGenerations(modelAccountRepository, account.id, false)

      return result
    } catch (error) {
      const errorMessage = error instanceof Error && error.message ? error.message : String(error)
      logger.error(`ProcessMj ${account.name}`, error)

      const errorType = defineError({ errorMessage })
      if (errorType !== ErrorType.INVALID_PROMPT && errorType !== ErrorType.MODERATION_FAILED) {
        const status = await handleErrorNotification(errorType, account, errorMessage, imagineParams, tgNotificationBotGateway)

        if (imagineParams.modelFunction !== 'button') {
          if (errorType !== 'MJ_7_ERROR') {
            await modelService.accountBalancer.midjourney.emergencySwitchNext({
              accountQueueId: account.queue_id!,
              status
            })
          }
          throw new Error('Generation failed, you can make another attempt!')
        }
        throw new Error('Button click failed! ')
      } else if (errorType === ErrorType.MODERATION_FAILED) {
        throw new ForbiddenError({
          code: 'VIOLATION'
        })
      } else {
        throw new Error('Invalid prompt! ' + errorMessage)
      }
    }
  }

  return processMj
}
