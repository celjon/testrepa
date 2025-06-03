import { AdapterParams } from '@/adapter/types'
import { buildCompileEmailTemplate } from './compile-email-template'
import { getTranlation, Translation } from './translation'

type Params = Pick<AdapterParams, 'mail'>

export type WelcomeMailParams = {
  user: {
    email: string
    password: string
  }
}

type TemplateParams = {
  t: Translation['welcomeMail']
} & WelcomeMailParams

export type SendWelcomeMail = (
  params: {
    to: string
    locale?: string
  } & WelcomeMailParams
) => Promise<void>

export const buildSendWelcomeMail = ({ mail: mailClient }: Params): SendWelcomeMail => {
  const compileTemplate = buildCompileEmailTemplate()
  const template = compileTemplate<TemplateParams>('welcome-mail.hbs')

  return async (params) => {
    const html = await template(
      {
        user: params.user,
        t: getTranlation('welcomeMail', params.locale)
      },
      params.locale
    )

    await mailClient.client.sendMail({
      from: 'no-reply@bothub.chat',
      to: params.to,
      subject: getTranlation('welcomeMailSubject', params.locale),
      html
    })
  }
}
