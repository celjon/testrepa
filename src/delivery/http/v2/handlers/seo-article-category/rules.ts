import { body, param, query } from 'express-validator'
import { Middlewares } from '../../middlewares'

export const buildSEOArticleCategoryRules = ({ authRequired, validateSchema }: Middlewares) => {
  const getSEOArticleCategoryRules = [param('seoArticleCategoryId').isString(), validateSchema]
  /**
   * @openapi
   * components:
   *   rules:
   *     createSEOArticleCategory:
   *       type: object
   *       properties:
   *         name:
   *           type: object
   *           properties:
   *             ru:
   *               type: string
   *             en:
   *               type: string
   *             es:
   *               type: string
   *             fr:
   *               type: string
   *             pt:
   *               type: string
   *       required:
   *         - name
   */
  const createSEOArticleCategoryRules = [
    authRequired({ adminOnly: true }),
    body('name').isObject(),
    validateSchema,
  ]
  /**
   * @openapi
   * components:
   *   rules:
   *     listSEOArticleCategory:
   *       type: object
   *       properties:
   *         page:
   *           type: number
   *         quantity:
   *           type: number
   */
  const listSEOArticleCategoryRules = [
    query('page').optional().isNumeric(),
    query('quantity').optional().isNumeric(),
    validateSchema,
  ]
  /**
   * @openapi
   * components:
   *   rules:
   *     updateSEOArticleCategory:
   *       type: object
   *       properties:
   *         name:
   *           type: object
   *           properties:
   *             ru:
   *               type: string
   *             en:
   *               type: string
   *             es:
   *               type: string
   *             fr:
   *               type: string
   *             pt:
   *               type: string
   */
  const updateSEOArticleCategoryRules = [
    authRequired({ adminOnly: true }),
    param('seoArticleCategoryId').isString(),
    validateSchema,
  ]
  const deleteSEOArticleCategoryRules = [
    authRequired({ adminOnly: true }),
    param('seoArticleCategoryId').isString(),
    validateSchema,
  ]

  return {
    getSEOArticleCategoryRules,
    listSEOArticleCategoryRules,
    createSEOArticleCategoryRules,
    updateSEOArticleCategoryRules,
    deleteSEOArticleCategoryRules,
  }
}
