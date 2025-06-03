import { NotFoundError } from '@/domain/errors'
import { UseCaseParams } from '../types'
import { ISEOArticleExpert } from '@/domain/entity/seo-article-expert'
import { slugification } from '@/lib/utils/text-slugification'

export type Create = (params: {
  name: string
  email: string
  telegram: string
  bio: string
  city: string
  country: string
  education: {
    university: string
    level: string
    form: string
    graduationYear: number
    faculty: string
    specialty: string
  }
  qualification: string
}) => Promise<ISEOArticleExpert>

export const buildCreate = ({ adapter }: UseCaseParams): Create => {
  return async ({ name, email, telegram, bio, city, country, education, qualification }) => {
    const seoArticleExpert = await adapter.seoArticleExpertRepository.create({
      data: { name, slug: slugification(name), email, telegram, bio, city, country, education, qualification }
    })

    if (!seoArticleExpert) {
      throw new NotFoundError({
        code: 'EXPERT_NOT_FOUND'
      })
    }

    return seoArticleExpert
  }
}
