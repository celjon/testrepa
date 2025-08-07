import { AdapterParams } from '@/adapter/types'
import { ISEOArticleTopic } from '@/domain/entity/seo-article-topic'
import { Prisma } from '@prisma/client'

type Params = Pick<AdapterParams, 'db'>

interface FindByLocalizedKeywordsArgs {
  keywords: string[]
  language: 'ru' | 'en' | 'es' | 'fr' | 'pt'
}

export type FindByLocalizedKeywords = (
  args: FindByLocalizedKeywordsArgs,
) => Promise<ISEOArticleTopic[] | never>

export const buildFindByLocalizedKeywords = ({ db }: Params): FindByLocalizedKeywords => {
  return async ({ keywords, language }) => {
    if (!keywords.length) return []

    const result = await db.client.$queryRaw<ISEOArticleTopic[]>(Prisma.sql`
      SELECT * FROM "seoArticleTopic"
      WHERE name->>${language} = ANY(ARRAY[${Prisma.join(keywords.map((k) => Prisma.sql`${k}`))}])
    `)

    return result
  }
}
