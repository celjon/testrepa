import { createHash, createHmac, timingSafeEqual } from 'crypto'
import { TGAuthResult } from './types'
import { InvalidDataError } from '@/domain/errors'

export const verifyTgAuthResult = (tgAuthResult: TGAuthResult, botToken: string): boolean => {
  const authDateMs = tgAuthResult.auth_date * 1000
  const minuteMs = 60 * 1000

  if (Date.now() - authDateMs > 15 * minuteMs) {
    throw new InvalidDataError({
      code: 'INVALID_CODE'
    })
  }

  const hashedBotToken = createHash('sha256').update(botToken).digest()
  const { hash, ...authParams } = tgAuthResult

  const params = (Object.keys(authParams) as Array<keyof typeof authParams>)
    .sort()
    .map((key) => `${key}=${authParams[key]}`)
    .join('\n')

  const recreated = createHmac('sha256', hashedBotToken).update(params).digest()

  const isValid = timingSafeEqual(recreated, Buffer.from(hash, 'hex'))

  return isValid
}
