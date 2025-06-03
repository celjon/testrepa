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

export type SendVerificationMail = (
  params: {
    to: string
    locale?: string
  } & VerificationMailParams
) => Promise<void>

export const buildSendVerificationMail = ({ mail: mailClient }: Params): SendVerificationMail => {
  const compileTemplate = buildCompileEmailTemplate()
  const template = compileTemplate<TemplateParams>('verification.hbs')

  return async (params) => {
    const html = await template(
      {
        verificationCode: params.verificationCode,
        t: getTranlation('verificationMail', params.locale)
      },
      params.locale
    )

    await mailClient.client.sendMail({
      from: 'no-reply@bothub.chat',
      to: params.to,
      subject: getTranlation('verificationMailSubject', params.locale),
      html
    })
  }
}
