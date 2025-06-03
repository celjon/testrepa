import { NotFoundError } from '@/domain/errors'
import { UseCaseParams } from '../types'
import { ISEOArticleTopic } from '@/domain/entity/seo-article-topic'
import { slugification } from '@/lib/utils/text-slugification'

export type Create = (params: {
  name: {
    ru: string
    en: string
    es: string
    fr: string
    pt: string
  }
  article_id: string
  category_id: string
}) => Promise<ISEOArticleTopic>

export const buildCreate = ({ adapter }: UseCaseParams): Create => {
  return async ({ name, article_id, category_id }) => {
    const seoArticleTopic = await adapter.seoArticleTopicRepository.create({
      data: { name, slug: slugification(name.en), article_id, category_id }
    })
    if (!seoArticleTopic) {
      throw new NotFoundError({
        code: 'TOPIC_NOT_FOUND'
      })
    }

    return seoArticleTopic
  }
}
