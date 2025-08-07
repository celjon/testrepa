import { Adapter } from '@/domain/types'
import { getRandom6DigitNumber } from '@/lib'
import { IVerificationCode } from '@/domain/entity/verification-code'

export type SendVerificationUpdateCode = (params: {
  userId: string
  email: string
  locale?: string
}) => Promise<[IVerificationCode, void] | never>

export const buildSendVerificationUpdateCode = ({
  verificationCodeRepository,
  mailGateway,
}: Adapter): SendVerificationUpdateCode => {
  return async ({ userId, email, locale }) => {
    const code = getRandom6DigitNumber()
    const verificationCodeTTLinMs = 24 * 3600 * 1000

    return Promise.all([
      verificationCodeRepository.create({
        data: {
          code,
          user_id: userId,
          expires_at: new Date(new Date().getTime() + verificationCodeTTLinMs),
        },
      }),

      mailGateway.sendEmailUpdateVerificationMail({
        to: email,
        verificationCode: code,
        locale: locale,
      }),
    ])
  }
}
