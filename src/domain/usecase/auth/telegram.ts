import { IUser } from '@/domain/entity/user'
import { config } from '@/config'
import { InvalidDataError } from '@/domain/errors'
import { UseCaseParams } from '../types'
import { actions } from '@/domain/entity/action'
import { Platform } from '@prisma/client'

export type Telegram = (data: {
  tgId?: string
  name?: string
  id?: string
  botSecretKey?: string
  invitedBy?: string
  yandexMetricClientId: string | null
  yandexMetricYclid: string | null
}) => Promise<{ user: IUser; accessToken: string } | never>
export const buildTelegram = ({ adapter, service }: UseCaseParams): Telegram => {
  return async ({
    tgId,
    name,
    id,
    botSecretKey,
    invitedBy,
    yandexMetricClientId,
    yandexMetricYclid,
  }) => {
    if (!botSecretKey || botSecretKey !== config.telegram.bot.secret_key) {
      throw new InvalidDataError({
        code: 'TOKEN_INVALID',
      })
    }

    let user
    if (tgId || id) {
      user = await adapter.userRepository.get({
        where: tgId ? { tg_id: tgId } : { id: id },
        include: {
          groups: {
            include: {
              chats: true,
            },
          },
          subscription: {
            include: {
              plan: true,
            },
          },
          employees: {
            include: {
              enterprise: true,
            },
          },
        },
      })
    }

    if (!user) {
      let linkedBefore = false
      const linkBeforeUser = await adapter.userRepository.get({
        where: { tg_id_before: tgId },
      })
      if (linkBeforeUser) {
        linkedBefore = true
      }

      user = await service.user.initialize(
        {
          tg_id: tgId,
          inactive: !tgId,
          name,
          emailVerified: false,
          yandexMetricClientId,
          yandexMetricYclid,
        },
        invitedBy,
        null,
        linkedBefore,
      )
      if (!user) {
        throw Error()
      }
      const groups = await adapter.groupRepository.list({
        where: {
          user_id: user.id,
        },
        include: {
          chats: true,
        },
      })
      user.groups = groups
    } else if (user.inactive && tgId) {
      await adapter.userRepository.update({
        where: { id: user.id },
        data: { inactive: false, tg_id: tgId, name: name },
      })
    }

    const { accessToken, refreshToken } = await service.auth.signAuthTokens({
      user,
      immortal: true,
      keyEncryptionKey: null,
    })

    await adapter.actionRepository.create({
      data: {
        type: actions.REGISTRATION,
        user_id: user.id,
        platform: Platform.TELEGRAM,
      },
    })

    return {
      user,
      accessToken,
      refreshToken,
    }
  }
}
