import { AdapterParams } from '@/adapter/types'
import { buildCompileEmailTemplate } from './compile-email-template'
import { getTranlation, Translation } from './translation'

type Params = Pick<AdapterParams, 'mail'>

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
  } & GiftTokenMailParams
) => Promise<void | never>

export const buildSendGiftTokenMail = ({ mail: mailClient }: Params): SendGiftTokenMail => {
  const compileTemplate = buildCompileEmailTemplate()
  const template = compileTemplate<TemplateParams>('gift-token.hbs')

  return async (params) => {
    const html = await template(
      {
        tokens: params.tokens,
        t: getTranlation('giftTokenMail', params.locale)
      },
      params.locale
    )

    await mailClient.client.sendMail({
      from: 'no-reply@bothub.chat',
      to: params.to,
      subject: getTranlation('giftTokenMailSubject', params.locale),
      html
    })
  }
}
