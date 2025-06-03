import { body, param, query } from 'express-validator'
import { Middlewares } from '../../middlewares'
import { config } from '@/config'

export const buildArticleRules = ({ allowedIps, authRequired, validateSchema }: Middlewares) => {
  /**
   * @openapi
   * components:
   *   rules:
   *     generateSubject:
   *       type: object
   *       properties:
   *         parentModelId:
   *           type: string
   *         generationMode:
   *           type: string
   *       required:
   *         - model_id
   *         - generationMode
   */
  const generateSubjectRules = [authRequired(), body('model_id').isString(), body('generationMode').isString(), validateSchema]

  /**
   * @openapi
   * components:
   *   rules:
   *      generatePlan:
   *          properties:
   *             generationMode:
   *                type: string
   *             subject:
   *                type: string
   *             creativity:
   *                type: number
   *             model_id:
   *                type: string
   *          required:
   *             - generationMode
   *             - subject
   *             - creativity
   *             - parentModelId
   */
  const generatePlanRules = [
    authRequired(),
    body('generationMode').isString(),
    body('subject').isString(),
    body('creativity').isNumeric(),
    body('model_id').isString(),
    validateSchema
  ]

  /** @openapi
   * components:
   *   rules:
   *      generatePlanHints:
   *          properties:
   *             generationMode:
   *                type: string
   *             subject:
   *                type: string
   *             plan:
   *                type: string
   *             creativity:
   *                type: number
   *             model_id:
   *                type: string
   *          required:
   *             - subject
   *             - plan
   *             - creativity
   */
  const generatePlanHintsRules = [
    authRequired(),
    body('generationMode').isString(),
    body('subject').isString(),
    body('plan').isString(),
    body('creativity').isNumeric(),
    body('model_id').isString(),
    validateSchema
  ]

  /**
   * @openapi
   * components:
   *   rules:
   *      addChapterToPlan:
   *          properties:
   *             generationMode:
   *                type: string
   *             subject:
   *                type: string
   *             plan:
   *                type: string
   *             locale:
   *                type: string
   *             creativity:
   *                type: number
   *             model_id:
   *                type: string
   *             chapter:
   *                type: string
   *          required:
   *             - generationMode
   *             - subject
   *             - plan
   *             - locale
   *             - creativity
   *             - model_id
   *             - chapter
   */
  const addChapterToPlanRules = [
    authRequired(),
    body('generationMode').isString(),
    body('subject').isString(),
    body('plan').isString(),
    body('locale').isString(),
    body('creativity').isNumeric(),
    body('model_id').isString(),
    body('chapter').isString(),
    validateSchema
  ]

  /**
   * @openapi
   * components:
   *   rules:
   *      generateArticle:
   *          properties:
   *             spentCaps:
   *                type: number
   *             generationMode:
   *                type: string
   *             subject:
   *                type: string
   *             plan:
   *                type: string
   *             creativity:
   *                type: number
   *             style:
   *                type: string
   *             customStyle:
   *                type: string
   *             model_id:
   *                type: string
   *             language:
   *                type: string
   *             linkStyle:
   *                type: string
   *             symbolsCount:
   *                type: number
   *             keywords:
   *                type: string
   *             sourceLink:
   *                type: string
   *          required:
   *             - spentCaps
   *             - generationMode
   *             - subject
   *             - plan
   *             - creativity
   *             - style
   *             - customStyle
   *             - model_id
   *             - language
   *             - linkStyle
   *             - symbolsCount
   *             - keywords
   *             - sourceLink
   *             - modelForSources
   */
  const generateArticleRules = [
    authRequired(),
    body('spentCaps').isNumeric(),
    body('generationMode').isString(),
    body('subject').isString(),
    body('plan').isString(),
    body('creativity').isNumeric(),
    body('style').isString(),
    body('customStyle').isString(),
    body('model_id').isString(),
    body('language').isString(),
    body('linkStyle').isString(),
    body('symbolsCount').isInt(),
    body('keywords').isString(),
    body('sourceLink').isString(),
    validateSchema
  ]

  const batchGenerateArticlesRules = [authRequired(), allowedIps(config.admin.allowed_ips), validateSchema]

  /**
   * @openapi
   * components:
   *   rules:
   *      generateChapter:
   *          properties:
   *             articleId:
   *                type: string
   *             model_id:
   *                type: string
   *             creativity:
   *                type: number
   *             chapterPrompt:
   *                type: string
   *             language:
   *                type: string
   *          required:
   *             - articleId
   *             - model_id
   *             - numeric
   *             - chapterPrompt
   *             - language
   */
  const generateChapterRules = [
    authRequired(),
    body('articleId').isString(),
    body('model_id').isString(),
    body('creativity').isNumeric(),
    body('language').isString(),
    body('chapterPrompt').isString(),
    validateSchema
  ]

  const getArticleRules = [authRequired(), param('articleId').isString(), validateSchema]
  const findBySlugRules = [param('slug').isString(), validateSchema]

  /**
   * @openapi
   * components:
   *   rules:
   *      updateArticle:
   *          properties:
   *             content:
   *                type: string
   *          required:
   *             - content
   */
  const updateArticleRules = [authRequired(), param('articleId').isString(), body('content').isString(), validateSchema]

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
    authRequired({ adminOnly: true }),
    query('page').optional().isNumeric(),
    query('search').optional().isString(),
    validateSchema
  ]
  const deleteArticleRules = [authRequired({ adminOnly: true }), param('articleId').isString(), validateSchema]
  /**
   * @openapi
   * components:
   *   rules:
   *     deleteManyArticles:
   *       type: object
   *       properties:
   *         articleIds:
   *           type: array
   *           items:
   *             type: string
   *       required:
   *         - articleIds
   */
  const deleteManyArticlesRules = [authRequired({ adminOnly: true }), body('articleIds').isArray().notEmpty(), validateSchema]

  return {
    generateSubjectRules,
    generatePlanRules,
    generatePlanHintsRules,
    addChapterToPlanRules,

    generateArticleRules,
    batchGenerateArticlesRules,
    generateChapterRules,
    getArticleRules,
    findBySlugRules,
    deleteArticleRules,
    updateArticleRules,
    listSEOArticlesRules,
    deleteManyArticlesRules
  }
}
