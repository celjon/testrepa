import { AdapterParams } from '@/adapter/types'
import { CompileTemplate } from './compile-email-template'
import { getTranslation, Translation } from './translation'

type Params = Pick<AdapterParams, 'mail'> & {
  compileTemplate: CompileTemplate
}

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
  } & VerificationMailParams,
) => Promise<void>

export const buildSendUpdateVerificationMail = ({
  mail: mailClient,
  compileTemplate,
}: Params): SendUpdateVerificationMail => {
  const template = compileTemplate<TemplateParams>('verification.hbs')

  return async (params) => {
    const html = await template(
      {
        verificationCode: params.verificationCode,
        t: getTranslation('updateVerificationMail', params.locale),
      },
      params.locale,
    )

    await mailClient.client.sendMail({
      from: 'no-reply@bothub.chat',
      to: params.to,
      subject: getTranslation('updateVerificationMailSubject', params.locale),
      html,
    })
  }
}
