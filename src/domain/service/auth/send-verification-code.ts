import { Adapter } from '@/domain/types'
import { getRandom6DigitNumber } from '@/lib'
import { IVerificationCode } from '@/domain/entity/verificationCode'

export type SendVerificationCode = (params: {
  userId: string
  email: string
  locale?: string
}) => Promise<[IVerificationCode, void] | never>

export const buildSendVerificationCode = ({ verificationCodeRepository, mailGateway }: Adapter): SendVerificationCode => {
  return async ({ userId, email, locale }) => {
    const code = getRandom6DigitNumber()
    const verificationCodeTTLinMs = 24 * 3600 * 1000

    return Promise.all([
      verificationCodeRepository.create({
        data: {
          code,
          user_id: userId,
          expires_at: new Date(new Date().getTime() + verificationCodeTTLinMs)
        }
      }),

      mailGateway.sendVerificationMail({
        to: email,
        verificationCode: code,
        locale: locale
      })
    ])
  }
}
