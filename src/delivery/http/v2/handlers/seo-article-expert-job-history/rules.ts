import { body, param } from 'express-validator'
import { Middlewares } from '../../middlewares'

export const buildSEOArticleExpertJobHistoryRules = ({ authRequired, validateSchema }: Middlewares) => {
  const getSEOArticleExpertJobHistoryRules = [param('seoArticleExpertJobHistoryId').isString(), validateSchema]
  /**
   * @openapi
   * components:
   *   rules:
   *     createSEOArticleExpertJobHistory:
   *       type: object
   *       properties:
   *         post:
   *           type: string
   *         from_date:
   *           type: string
   *           format: date
   *         to_date:
   *           type: string
   *           format: date
   *         company:
   *           type: string
   *         city:
   *           type: string
   *         duties:
   *           type: array
   *           items:
   *             type: string
   *         achievements:
   *           type: array
   *           items:
   *             type: string
   *         description:
   *           type: string
   *         seo_expert_id:
   *           type: string
   *       required:
   *         - post
   *         - from_date
   *         - to_date
   *         - company
   *         - city
   *         - duties
   *         - achievements
   *         - description
   *         - seo_expert_id
   */
  const createSEOArticleExpertJobHistoryRules = [
    authRequired({ adminOnly: true }),
    body('post').isString(),
    body('from_date').isDate(),
    body('to_date').isDate(),
    body('company').isString(),
    body('city').isString(),
    body('duties').isArray(),
    body('achievements').isArray(),
    body('description').isString(),
    body('seo_expert_id').isString(),
    validateSchema
  ]
  /**
   * @openapi
   * components:
   *   rules:
   *     updateSEOArticleExpertJobHistory:
   *       type: object
   *       properties:
   *         post:
   *           type: string
   *         from_date:
   *           type: string
   *           format: date
   *         to_date:
   *           type: string
   *           format: date
   *         company:
   *           type: string
   *         city:
   *           type: string
   *         duties:
   *           type: array
   *           items:
   *             type: string
   *         achievements:
   *           type: array
   *           items:
   *             type: string
   *         description:
   *           type: string
   *         seo_expert_id:
   *           type: string
   */
  const updateSEOArticleExpertJobHistoryRules = [
    authRequired({ adminOnly: true }),
    param('seoArticleExpertJobHistoryId').isString(),
    validateSchema
  ]
  const deleteSEOArticleExpertJobHistoryRules = [
    authRequired({ adminOnly: true }),
    param('seoArticleExpertJobHistoryId').isString(),
    validateSchema
  ]

  return {
    getSEOArticleExpertJobHistoryRules,
    createSEOArticleExpertJobHistoryRules,
    updateSEOArticleExpertJobHistoryRules,
    deleteSEOArticleExpertJobHistoryRules
  }
}
