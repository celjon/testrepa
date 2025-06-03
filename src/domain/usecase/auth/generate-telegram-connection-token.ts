import { UseCaseParams } from '@/domain/usecase/types'
import { signJWT } from '@/lib'
import { ForbiddenError, NotFoundError } from '@/domain/errors'

export type GenerateTelegramConnectionToken = (data: { userId: string }) => Promise<
  | {
      telegramConnectionToken: string
    }
  | never
>
export const buildGenerateTelegramConnectionToken = ({ adapter }: UseCaseParams): GenerateTelegramConnectionToken => {
  return async ({ userId }) => {
    const user = await adapter.userRepository.get({
      where: { id: userId }
    })

    if (!user) {
      throw new NotFoundError({
        code: 'USER_NOT_FOUND'
      })
    }

    if (!user.tg_id || user.email) {
      throw new ForbiddenError({
        code: 'TELEGRAM_ALREADY_CONNECTED'
      })
    }
    return {
      telegramConnectionToken: signJWT({
        id: userId,
        expiresIn: '1h',
        keyEncryptionKey: null
      })
    }
  }
}
