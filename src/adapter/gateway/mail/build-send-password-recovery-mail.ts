import { config } from '@/config'
import { AdapterParams } from '@/adapter/types'
import { CompileTemplate } from './compile-email-template'
import { getTranslation, Translation } from './translation'

type Params = Pick<AdapterParams, 'mail'> & {
  compileTemplate: CompileTemplate
}

type TemplateParams = {
  t: Translation['passwordRecoveryMail']
} & {
  recoveryURL: string
}

export type PasswordRecoveryMailParams = {
  token: string
}

export type SendPasswordRecoveryMail = (
  params: {
    to: string
    locale?: string
  } & PasswordRecoveryMailParams,
) => Promise<void>

export const buildSendPasswordRecoveryMail = ({
  mail: mailClient,
  compileTemplate,
}: Params): SendPasswordRecoveryMail => {
  const template = compileTemplate<TemplateParams>('password-recovery.hbs')

  return async (params) => {
    const recoveryURL = `${config.frontend.address}${params.locale ? params.locale : config.frontend.default_locale}/reset-password?token=${params.token}`

    const html = await template(
      {
        recoveryURL,
        t: getTranslation('passwordRecoveryMail', params.locale),
      },
      params.locale,
    )

    await mailClient.client.sendMail({
      from: 'no-reply@bothub.chat',
      to: params.to,
      subject: getTranslation('passwordRecoveryMailSubject', params.locale),
      html,
    })
  }
}
