import { AdapterParams } from '@/adapter/types'
import { CompileTemplate } from './compile-email-template'
import { getTranslation, Translation } from './translation'

type Params = Pick<AdapterParams, 'mail'> & {
  compileTemplate: CompileTemplate
}

type TemplateParams = {
  t: Translation['giftTokenMail']
} & GiftTokenMailParams

export type GiftTokenMailParams = {
  tokens: number
}

export type SendGiftTokenMail = (
  params: {
    to: string
    locale?: string
  } & GiftTokenMailParams,
) => Promise<void | never>

export const buildSendGiftTokenMail = ({
  mail: mailClient,
  compileTemplate,
}: Params): SendGiftTokenMail => {
  const template = compileTemplate<TemplateParams>('gift-token.hbs')

  return async (params) => {
    const html = await template(
      {
        tokens: params.tokens,
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
