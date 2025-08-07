import { AdapterParams } from '@/adapter/types'
import { CompileTemplate } from './compile-email-template'
import { getTranslation, Translation } from './translation'

type Params = Pick<AdapterParams, 'mail'> & {
  compileTemplate: CompileTemplate
}

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
  } & ArticlesLinksMailParams,
) => Promise<void>

export const buildSendLinksToGeneratedArticlesMail = ({
  mail: mailClient,
  compileTemplate,
}: Params): SendLinksToGeneratedArticlesMail => {
  const template = compileTemplate<TemplateParams>('links-to-generated-articles.hbs')

  return async (params) => {
    const html = await template(
      {
        articlesLinks: params.articlesLinks,
        t: getTranslation('generatedArticlesLinksMail', params.locale),
      },
      params.locale,
    )

    await mailClient.client.sendMail({
      from: 'no-reply@bothub.chat',
      to: params.to,
      subject: getTranslation('generatedArticlesLinksMailSubject', params.locale),
      html,
    })
  }
}
