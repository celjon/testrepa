import { UseCaseParams } from '@/domain/usecase/types'
import { signJWT } from '@/lib'
import { NotFoundError } from '@/domain/errors'

export type GenerateTelegramConnectionTokenPython = (data: { userId: string }) => Promise<
  | {
      telegramConnectionToken: string
    }
  | never
>

export const buildGenerateTelegramConnectionTokenPython = ({
  adapter,
}: UseCaseParams): GenerateTelegramConnectionTokenPython => {
  return async ({ userId }) => {
    const user = await adapter.userRepository.get({
      where: { id: userId },
    })

    if (!user) {
      throw new NotFoundError({
        code: 'USER_NOT_FOUND',
      })
    }

    //генерируем новый токен с дополнительным флагом pythonBot

    return {
      telegramConnectionToken: signJWT({
        id: userId,
        pythonBot: true,
        expiresIn: '1h',
        keyEncryptionKey: null,
      }),
    }
  }
}
