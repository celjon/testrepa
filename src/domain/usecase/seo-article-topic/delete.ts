import { NotFoundError } from '@/domain/errors'
import { UseCaseParams } from '../types'
import { ISEOArticleTopic } from '@/domain/entity/seo-article-topic'

export type Delete = (params: { id: string }) => Promise<ISEOArticleTopic>

export const buildDelete = ({ adapter }: UseCaseParams): Delete => {
  return async ({ id }) => {
    let seoArticleTopic = await adapter.seoArticleTopicRepository.get({ where: { id } })
    if (seoArticleTopic) {
      seoArticleTopic = await adapter.seoArticleTopicRepository.delete({
        where: { id }
      })
    }
    if (!seoArticleTopic) {
      throw new NotFoundError({
        code: 'TOPIC_NOT_FOUND'
      })
    }

    return seoArticleTopic
  }
}
