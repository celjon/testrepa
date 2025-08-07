import { AdapterParams } from '@/adapter/types'
import { CompileTemplate } from './compile-email-template'
import { getTranslation, Translation } from './translation'

type Params = Pick<AdapterParams, 'mail'> & {
  compileTemplate: CompileTemplate
}

type TemplateParams = {
  t: Translation['softLimitMail']
}

export type SendSoftLimitMail = (params: { to: string; locale?: string }) => Promise<void>

export const buildSendSoftLimitMail = ({
  mail: mailClient,
  compileTemplate,
}: Params): SendSoftLimitMail => {
  const template = compileTemplate<TemplateParams>('soft-limit.hbs')

  return async (params) => {
    const html = await template(
      {
        t: getTranslation('softLimitMail', params.locale),
      },
      params.locale,
    )

    await mailClient.client.sendMail({
      from: 'no-reply@bothub.chat',
      to: params.to,
      subject: getTranslation('softLimitMailSubject', params.locale),
      html,
    })
  }
}
