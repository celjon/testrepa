import { ISEOArticleExpert } from '@/domain/entity/seo-article-expert'
import { NotFoundError } from '@/domain/errors'
import { UseCaseParams } from '../types'
import { slugification } from '@/lib/utils/text-slugification'

export type Update = (params: {
  id: string
  name?: string
  email?: string
  telegram?: string
  bio?: string
  city?: string
  country?: string
  education?: {
    university: string
    level: string
    form: string
    graduationYear: number
    faculty: string
    specialty: string
  }
  qualification?: string
}) => Promise<ISEOArticleExpert>

export const buildUpdate = ({ adapter }: UseCaseParams): Update => {
  return async ({ id, name, email, telegram, bio, city, country, education, qualification }) => {
    let seoArticleExpert = await adapter.seoArticleExpertRepository.get({ where: { id } })
    if (seoArticleExpert) {
      const slug = name ? slugification(name) : undefined
      seoArticleExpert = await adapter.seoArticleExpertRepository.update({
        where: { id },
        data: {
          name,
          slug,
          email,
          telegram,
          bio,
          city,
          country,
          education,
          qualification
        }
      })
    }
    if (!seoArticleExpert) {
      throw new NotFoundError({
        code: 'EXPERT_NOT_FOUND'
      })
    }

    return seoArticleExpert
  }
}
