import { Adapter } from '@/domain/types'

export type SendLinksToGeneratedArticles = (params: { email: string; articleLinks: string; locale?: string }) => Promise<[void] | never>

export const buildSendLinksToGeneratedArticles = ({ mailGateway }: Adapter): SendLinksToGeneratedArticles => {
  return async ({ email, articleLinks, locale }) => {
    return Promise.all([
      mailGateway.sendLinksToGeneratedArticlesMail({
        to: email,
        articlesLinks: articleLinks,
        locale
      })
    ])
  }
}
