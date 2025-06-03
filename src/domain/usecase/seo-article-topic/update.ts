import { ISEOArticleTopic } from '@/domain/entity/seo-article-topic'
import { NotFoundError } from '@/domain/errors'
import { UseCaseParams } from '../types'
import { slugification } from '@/lib/utils/text-slugification'

export type Update = (params: {
  id: string
  name?: { ru?: string; en?: string; es?: string; fr?: string; pt?: string }
  article_id?: string
  category_id?: string
}) => Promise<ISEOArticleTopic>

export const buildUpdate = ({ adapter }: UseCaseParams): Update => {
  return async ({ id, name, article_id, category_id }) => {
    let seoArticleTopic = await adapter.seoArticleTopicRepository.get({ where: { id } })
    if (seoArticleTopic) {
      seoArticleTopic = await adapter.seoArticleTopicRepository.update({
        where: { id: id },
        data: {
          name,
          slug: name?.en ? slugification(name.en) : undefined,
          article_id,
          category_id
        }
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
