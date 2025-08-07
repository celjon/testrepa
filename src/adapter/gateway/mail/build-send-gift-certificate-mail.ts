import { AdapterParams } from '@/adapter/types'
import { CompileTemplate } from './compile-email-template'
import { getTranslation, Translation } from './translation'

type Params = Pick<AdapterParams, 'mail'> & {
  compileTemplate: CompileTemplate
}

type TemplateParams = {
  t: Translation['giftTokenMail']
  amount: number
  code: string
  message?: string
  recipient_name?: string
}

export type SendGiftCertificateMail = (params: {
  to: string
  amount: number
  code: string
  message?: string
  recipient_name?: string
  locale?: string
}) => Promise<void | never>

export const buildSendGiftCertificateMail = ({
  mail: mailClient,
  compileTemplate,
}: Params): SendGiftCertificateMail => {
  const template = compileTemplate<TemplateParams>('gift-certificate.hbs')

  return async (params) => {
    const html = await template(
      {
        amount: params.amount,
        code: params.code,
        message: params.message ?? '',
        recipient_name: params.recipient_name ?? '',
        t: getTranslation('giftTokenMail', params.locale),
      },
      params.locale,
    )

    await mailClient.client.sendMail({
      from: 'no-reply@bothub.chat',
      to: params.to,
      subject: getTranslation('giftTokenMailSubject', params.locale),
      html,
    })
  }
}
