import { AdapterParams } from '@/adapter/types'
import { buildCompileEmailTemplate } from './compile-email-template'
import { getTranlation, Translation } from './translation'

type Params = Pick<AdapterParams, 'mail'>

export type ArticlesLinksMailParams = {
  articlesLinks: string
}

type TemplateParams = {
  t: Translation['generatedArticlesLinksMail']
} & ArticlesLinksMailParams

export type SendLinksToGeneratedArticlesMail = (
  params: {
    to: string
    locale?: string
  } & ArticlesLinksMailParams
) => Promise<void>

export const buildSendLinksToGeneratedArticlesMail = ({ mail: mailClient }: Params): SendLinksToGeneratedArticlesMail => {
  const compileTemplate = buildCompileEmailTemplate()
  const template = compileTemplate<TemplateParams>('links-to-generated-articles.hbs')

  return async (params) => {
    const html = await template(
      {
        articlesLinks: params.articlesLinks,
        t: getTranlation('generatedArticlesLinksMail', params.locale)
      },
      params.locale
    )

    await mailClient.client.sendMail({
      from: 'no-reply@bothub.chat',
      to: params.to,
      subject: getTranlation('generatedArticlesLinksMailSubject', params.locale),
      html
    })
  }
}
