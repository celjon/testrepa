import { Adapter } from '@/adapter'
import { buildPaginate, Paginate } from './paginate'
import { buildSendLinksToGeneratedArticles, SendLinksToGeneratedArticles } from './send-links-to-generated-articles'

type Params = Adapter

export type ArticleService = {
  paginate: Paginate
  sendLinksToGeneratedArticles: SendLinksToGeneratedArticles
}
export const buildArticleService = (params: Params): ArticleService => {
  const paginate = buildPaginate(params)
  const sendLinksToGeneratedArticles = buildSendLinksToGeneratedArticles(params)
  return {
    paginate,
    sendLinksToGeneratedArticles
  }
}
