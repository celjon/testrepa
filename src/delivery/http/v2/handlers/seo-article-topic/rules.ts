import { body, param } from 'express-validator'
import { Middlewares } from '../../middlewares'

export const buildSEOArticleTopicRules = ({ authRequired, validateSchema }: Middlewares) => {
  const getSEOArticleTopicRules = [param('seoArticleTopicId').isString(), validateSchema]
  /**
   * @openapi
   * components:
   *   rules:
   *     createSEOArticleTopic:
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
   *         article_id:
   *           type: string
   *         category_id:
   *           type: string
   *       required:
   *         - name
   */
  const createSEOArticleTopicRules = [
    authRequired({ adminOnly: true }),
    body('name').isObject(),
    body('article_id').isString(),
    body('category_id').isString(),
    validateSchema
  ]
  /**
   * @openapi
   * components:
   *   rules:
   *     updateSEOArticleTopic:
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
   *         article_id:
   *           type: string
   *         category_id:
   *           type: string
   *       required:
   *         - content
   */
  const updateSEOArticleTopicRules = [authRequired({ adminOnly: true }), param('seoArticleTopicId').isString(), validateSchema]
  const deleteSEOArticleTopicRules = [authRequired({ adminOnly: true }), param('seoArticleTopicId').isString(), validateSchema]

  return {
    getSEOArticleTopicRules,
    createSEOArticleTopicRules,
    updateSEOArticleTopicRules,
    deleteSEOArticleTopicRules
  }
}
