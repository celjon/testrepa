import { AdapterParams } from '@/adapter/types'
import { buildCompileEmailTemplate } from './compile-email-template'
import { getTranlation, Translation } from './translation'

type Params = Pick<AdapterParams, 'mail'>

type TemplateParams = {
  t: Translation['passwordRecoveryMail']
} & PasswordRecoveryMailParams

export type PasswordRecoveryMailParams = {
  recoveryURL: string
}

export type SendPasswordRecoveryMail = (
  params: {
    to: string
    locale?: string
  } & PasswordRecoveryMailParams
) => Promise<void>

export const buildSendPasswordRecoveryMail = ({ mail: mailClient }: Params): SendPasswordRecoveryMail => {
  const compileTemplate = buildCompileEmailTemplate()
  const template = compileTemplate<TemplateParams>('password-recovery.hbs')

  return async (params) => {
    const html = await template(
      {
        recoveryURL: params.recoveryURL,
        t: getTranlation('passwordRecoveryMail', params.locale)
      },
      params.locale
    )

    await mailClient.client.sendMail({
      from: 'no-reply@bothub.chat',
      to: params.to,
      subject: getTranlation('passwordRecoveryMailSubject', params.locale),
      html
    })
  }
}
