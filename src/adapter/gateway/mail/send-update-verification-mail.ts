import { AdapterParams } from '@/adapter/types'
import { buildCompileEmailTemplate } from './compile-email-template'
import { getTranlation, Translation } from './translation'

type Params = Pick<AdapterParams, 'mail'>

export type VerificationMailParams = {
  verificationCode: string
}

type TemplateParams = {
  t: Translation['verificationMail']
} & VerificationMailParams

export type SendUpdateVerificationMail = (
  params: {
    to: string
    locale?: string
  } & VerificationMailParams
) => Promise<void>

export const buildSendUpdateVerificationMail = ({ mail: mailClient }: Params): SendUpdateVerificationMail => {
  const compileTemplate = buildCompileEmailTemplate()
  const template = compileTemplate<TemplateParams>('verification.hbs')

  return async (params) => {
    const html = await template(
      {
        verificationCode: params.verificationCode,
        t: getTranlation('updateVerificationMail', params.locale)
      },
      params.locale
    )

    await mailClient.client.sendMail({
      from: 'no-reply@bothub.chat',
      to: params.to,
      subject: getTranlation('updateVerificationMailSubject', params.locale),
      html
    })
  }
}
