import { UseCaseParams } from '@/domain/usecase/types'
import { signJWT } from '@/lib'
import { ForbiddenError, NotFoundError } from '@/domain/errors'

export type GenerateTelegramUnlinkToken = (data: {
  userId: string
}) => Promise<{ telegramUnlinkToken: string } | never>
export const buildGenerateTelegramUnlinkToken = ({
  adapter,
}: UseCaseParams): GenerateTelegramUnlinkToken => {
  return async ({ userId }) => {
    const user = await adapter.userRepository.get({
      where: { id: userId },
    })

    if (!user) {
      throw new NotFoundError({
        code: 'USER_NOT_FOUND',
      })
    }

    if (user.tg_id && !user.email) {
      throw new ForbiddenError({
        code: 'TELEGRAM_ALREADY_UNCONNECTED',
      })
    }
    return {
      telegramUnlinkToken: signJWT({
        id: userId,
        expiresIn: '1h',
      }),
    }
  }
}
