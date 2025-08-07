import { NotFoundError } from '@/domain/errors'
import { UseCaseParams } from '../types'
import { ISEOArticleTopic } from '@/domain/entity/seo-article-topic'

export type Get = (params: { id: string }) => Promise<ISEOArticleTopic>

export const buildGet = ({ adapter }: UseCaseParams): Get => {
  return async ({ id }) => {
    const seoArticleTopic = await adapter.seoArticleTopicRepository.get({
      where: { id },
    })

    if (!seoArticleTopic) {
      throw new NotFoundError({
        code: 'TOPIC_NOT_FOUND',
      })
    }

    return seoArticleTopic
  }
}
