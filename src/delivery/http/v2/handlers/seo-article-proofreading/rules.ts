import { body, param } from 'express-validator'
import { Middlewares } from '../../middlewares'

export const buildSEOArticleProofreadingRules = ({ authRequired, validateSchema }: Middlewares) => {
  const getSEOArticleProofreadingRules = [
    param('seoArticleProofreadingId').isString(),
    validateSchema,
  ]
  /**
   * @openapi
   * components:
   *   rules:
   *     createSEOArticleProofreading:
   *       type: object
   *       properties:
   *         expert_id:
   *           type: string
   *         article_id:
   *           type: string
   *       required:
   *         - expert_id
   *         - article_id
   */
  const createSEOArticleProofreadingRules = [
    authRequired({ adminOnly: true }),
    body('expert_id').isString(),
    body('article_id').isString(),
    validateSchema,
  ]

  /**
   * @openapi
   * components:
   *   rules:
   *     createManySEOArticleProofreading:
   *       type: object
   *       properties:
   *         articleIds:
   *           type: array
   *           items:
   *             type: string
   *         expert_id:
   *           type: string
   *       required:
   *         - articleIds
   *         - comment
   *         - approved
   *         - expert_id
   */
  const createManySEOArticleProofreadingRules = [
    authRequired({ adminOnly: true }),
    body('expert_id').isString(),
    body('articleIds').isArray().notEmpty(),
    validateSchema,
  ]

  /**
   * @openapi
   * components:
   *   rules:
   *     updateSEOArticleProofreading:
   *       type: object
   *       properties:
   *         properties:
   *         expert_id:
   *           type: string
   *         article_id:
   *           type: string
   */
  const updateSEOArticleProofreadingRules = [
    authRequired({ adminOnly: true }),
    param('seoArticleProofreadingId').isString(),
    validateSchema,
  ]
  const deleteSEOArticleProofreadingRules = [
    authRequired({ adminOnly: true }),
    param('seoArticleProofreadingId').isString(),
    validateSchema,
  ]

  return {
    getSEOArticleProofreadingRules,
    createManySEOArticleProofreadingRules,
    createSEOArticleProofreadingRules,
    updateSEOArticleProofreadingRules,
    deleteSEOArticleProofreadingRules,
  }
}
