import { Response } from 'express'
import { DeliveryParams } from '@/delivery/types'
import { AuthRequest } from '../types'
import { ISEOArticleCategory } from '@/domain/entity/seo-article-category'
import { IArticle } from '@/domain/entity/article'
import { NotFoundError } from '@/domain/errors'

type Params = Pick<DeliveryParams, 'seoArticleCategory' | 'article'>

export type FindCategoryOeArticleBySlug = (req: AuthRequest, res: Response) => Promise<void>

export const buildFindCategoryOrArticleBySlug = ({ seoArticleCategory, article }: Params): FindCategoryOeArticleBySlug => {
  return async (req, res) => {
    let result: ISEOArticleCategory | IArticle | null = await seoArticleCategory.findBySlug({
      slug: req.params.slug as string
    })
    if (!result) {
      result = await article.findBySlug({
        slug: req.params.slug as string
      })
    }
    if (!result) {
      throw new NotFoundError({
        code: 'CATEGORY_OR_ARTICLE_NOT_FOUND'
      })
    }

    res.status(200).json(result)
  }
}
