import { UseCaseParams } from '../types'
import { ISEOArticleExpert } from '@/domain/entity/seo-article-expert'

export type FindBySlug = (params: { slug: string }) => Promise<ISEOArticleExpert | null>

export const buildFindBySlug = ({ adapter }: UseCaseParams): FindBySlug => {
  return async ({ slug }) => {
    const expert = await adapter.seoArticleExpertRepository.get({
      where: { slug: slug },
      include: {
        experience: true,
      },
    })

    return expert
  }
}
