import { Adapter } from '@/domain/types'
import { Next } from './next'
import { IModelAccount } from '@/domain/entity/model-account'
import { NotFoundError } from '@/domain/errors'
import { TgBotParseMode } from '@/lib/clients/tg-bot'
import { logger } from '@/lib/logger'
import { config } from '@/config'

type Params = Adapter & {
  next: Next
}

export type FindAvailableAccount = () => Promise<IModelAccount>

export const buildFindAvailableAccount = ({
  next,
  tgNotificationBotGateway,
}: Params): FindAvailableAccount => {
  const findAvailableAccount = async (attempt = 0): Promise<IModelAccount> => {
    const MAX_ATTEMPTS = 3
    if (attempt >= MAX_ATTEMPTS) {
      try {
        await tgNotificationBotGateway.send(
          'ЗАКОНЧИЛИСЬ АКТИВНЫЕ АККАУНТЫ!!\n\n' +
            `ПРОВЕРЬТЕ <a href=${JSON.stringify(config.frontend.address + 'admin')}>АДМИН ПАНЕЛЬ</a>.`,
          TgBotParseMode.HTML,
        )
      } catch (error) {
        logger.error('mj findAvailableAccount', error)
      }
      throw new NotFoundError({
        code: 'NO_AVAILABLE_ACCOUNTS',
        message: 'No available accounts, please try again later',
      })
    }

    try {
      return await next()
    } catch (error) {
      return await findAvailableAccount(attempt + 1)
    }
  }

  return findAvailableAccount
}
