import { param, query } from 'express-validator'
import { Middlewares } from '../../middlewares'

export const buildSEOArticleRules = ({ validateSchema }: Middlewares) => {
  const findBySlugRules = [param('slug').isString(), validateSchema]

  /**
   * @openapi
   * components:
   *   rules:
   *     listSEOArticles:
   *       type: object
   *       properties:
   *         search:
   *           type: string
   *         page:
   *           type: number
   *         quantity:
   *           type: number
   */
  const listSEOArticlesRules = [
    query('page').optional().isNumeric(),
    query('quantity').optional().isNumeric(),
    query('search').optional().isString(),
    validateSchema,
  ]
  /**
   * @openapi
   * components:
   *   rules:
   *     listSEOArticles:
   *       type: object
   *       properties:
   *         slug:
   *           type: string
   *         page:
   *           type: number
   *         quantity:
   *           type: number
   */
  const listSEOArticlesBySlugRules = [
    param('slug').isString(),
    query('page').optional().isNumeric(),
    query('quantity').optional().isNumeric(),
    validateSchema,
  ]
  /**
   * @openapi
   * components:
   *   rules:
   *     listSEOArticles:
   *       type: object
   *       properties:
   *         categorySlug:
   *           type: string
   *         topicSlug:
   *           type: string
   *         page:
   *           type: number
   *         quantity:
   *           type: number
   */
  const listSEOArticlesByCategoryAndTopicSlugRules = [
    param('categorySlug').isString(),
    param('topicSlug').isString(),
    query('page').optional().isNumeric(),
    query('quantity').optional().isNumeric(),
    validateSchema,
  ]

  return {
    findBySlugRules,
    listSEOArticlesBySlugRules,
    listSEOArticlesByCategoryAndTopicSlugRules,
    listSEOArticlesRules,
  }
}
