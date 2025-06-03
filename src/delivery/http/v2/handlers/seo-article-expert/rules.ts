import { body, param } from 'express-validator'
import { Middlewares } from '../../middlewares'

export const buildSEOArticleExpertRules = ({ authRequired, validateSchema }: Middlewares) => {
  const getSEOArticleExpertRules = [param('seoExpertId').isString(), validateSchema]
  const findBySlugRules = [param('slug').isString(), validateSchema]
  /**
   * @openapi
   * components:
   *   rules:
   *     createSEOArticleExpert:
   *       type: object
   *       properties:
   *         name:
   *           type: string
   *         email:
   *           type: string
   *         telegram:
   *           type: string
   *         bio:
   *           type: string
   *         city:
   *           type: string
   *         country:
   *           type: string
   *         education:
   *           type: object
   *           properties:
   *             university:
   *               type: string
   *             level:
   *               type: string
   *             form:
   *               type: string
   *             graduationYear:
   *               type: integer
   *             faculty:
   *               type: string
   *             specialty:
   *               type: string
   *         qualification:
   *           type: string
   *       required:
   *         - name
   *         - bio
   *         - city
   *         - country
   *         - education
   *         - qualification
   */
  const createSEOArticleExpertRules = [
    authRequired({ adminOnly: true }),
    body('name').isString(),
    body('bio').isString(),
    body('city').isString(),
    body('country').isString(),
    body('qualification').isString(),
    validateSchema
  ]
  /**
   * @openapi
   * components:
   *   rules:
   *     updateSEOArticleExpert:
   *       type: object
   *       properties:
   *         name:
   *           type: string
   *         bio:
   *           type: string
   *         city:
   *           type: string
   *         country:
   *           type: string
   *         education:
   *           type: object
   *           properties:
   *             university:
   *               type: string
   *             level:
   *               type: string
   *             form:
   *               type: string
   *             graduationYear:
   *               type: integer
   *             faculty:
   *               type: string
   *             specialty:
   *               type: string
   *         qualification:
   *           type: string
   */
  const updateSEOArticleExpertRules = [authRequired({ adminOnly: true }), param('seoExpertId').isString(), validateSchema]
  const deleteSEOArticleExpertRules = [authRequired({ adminOnly: true }), param('seoExpertId').isString(), validateSchema]

  return {
    getSEOArticleExpertRules,
    findBySlugRules,
    createSEOArticleExpertRules,
    updateSEOArticleExpertRules,
    deleteSEOArticleExpertRules
  }
}
