import Express from 'express'
import { DeliveryParams } from '@/delivery/types'
import { createRouteHandler } from '../../routeHandler'
import { IHandler } from '../types'
import { buildArticleRules } from './rules'
import { buildGenerateSubject, GenerateSubject } from './generate-subject'
import { buildGeneratePlan, GeneratePlan } from './generate-plan'
import {
  buildGenerateArticle,
  buildGenerateArticleMiddleware,
  GenerateArticle,
} from './generate-article'
import { buildGeneratePlanHints, GeneratePlanHints } from './generate-plan-hints'
import { Middlewares } from '../../middlewares'
import { buildGenerateChapter, GenerateChapter } from './generate-chapter'
import { buildGetArticle, GetArticle } from './get'
import { buildAddChapterToPlan, AddChapterToPlan } from './add-chapter-to-plan'
import { buildUpdateArticle, UpdateArticle } from './update'
import {
  buildBatchGenerateArticles,
  buildBatchGenerateArticlesMiddleware,
  BatchGenerateArticles,
} from './batch-generate-articles'
import { buildDeleteArticle, DeleteArticle } from './delete'
import { buildDeleteMany, DeleteMany } from './delete-many'

type Params = Pick<DeliveryParams, 'article' | 'middlewares'>

type ArticleMethods = {
  generateSubject: GenerateSubject
  generatePlan: GeneratePlan
  generatePlanHints: GeneratePlanHints
  addChapterToPlan: AddChapterToPlan

  generateArticle: GenerateArticle
  batchGenerateArticles: BatchGenerateArticles
  generateChapter: GenerateChapter
  get: GetArticle
  update: UpdateArticle
  deleteArticle: DeleteArticle
  deleteMany: DeleteMany
}

const buildRegisterRoutes = (methods: ArticleMethods, middlewares: Middlewares) => {
  const {
    generateArticleRules,
    batchGenerateArticlesRules,
    generatePlanRules,
    generateSubjectRules,
    generatePlanHintsRules,
    generateChapterRules,
    getArticleRules,
    updateArticleRules,
    deleteArticleRules,
    deleteManyArticlesRules,
  } = buildArticleRules(middlewares)
  const generateArticleMiddleware = buildGenerateArticleMiddleware(middlewares)
  const batchGenerateArticlesMiddleware = buildBatchGenerateArticlesMiddleware(middlewares)

  return (root: Express.Router) => {
    const namespace = Express.Router()

    /**
     * @openapi
     * /article/subject:
     *   post:
     *     security:
     *      - bearerAuth: []
     *     tags: [Article]
     *     produces:
     *       - application/json
     *     requestBody:
     *       in: body
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/rules/generateSubject'
     */
    namespace.post('/subject', generateSubjectRules, createRouteHandler(methods.generateSubject))

    /**
     * @openapi
     * /article/plan:
     *   post:
     *     security:
     *      - bearerAuth: []
     *     tags: [Article]
     *     produces:
     *       - application/json
     *     requestBody:
     *       in: body
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/rules/generatePlan'
     */
    namespace.post('/plan', generatePlanRules, createRouteHandler(methods.generatePlan))

    /**
     * @openapi
     * /article/plan/hints:
     *   post:
     *     security:
     *      - bearerAuth: []
     *     tags: [Article]
     *     produces:
     *       - application/json
     *     requestBody:
     *       in: body
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/rules/generatePlanHints'
     *     responses:
     *       200:
     *         description: Hints generation result
     *         content:
     *           application/json:
     *             schema:
     *               properties:
     *                 hints:
     *                   type: array
     *                   items:
     *                     type: string
     *                 spentCaps:
     *                   type: number
     *                 caps:
     *                   type: number
     */
    namespace.post(
      '/plan/hints',
      generatePlanHintsRules,
      createRouteHandler(methods.generatePlanHints),
    )

    /**
     * @openapi
     * /article/plan/chapter:
     *   post:
     *     security:
     *      - bearerAuth: []
     *     tags: [Article]
     *     produces:
     *       - application/json
     *     requestBody:
     *       in: body
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/rules/addChapterToPlan'
     */
    namespace.post(
      '/plan/chapter',
      generatePlanHintsRules,
      createRouteHandler(methods.addChapterToPlan),
    )

    /**
     * @openapi
     * /article/generate:
     *   post:
     *     security:
     *      - bearerAuth: []
     *     tags: [Article]
     *     produces:
     *       - application/json
     *     requestBody:
     *       in: body
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/rules/generateArticle'
     *     responses:
     *       200:
     *         description: Article
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/entities/Article'
     */
    namespace.post(
      '/generate',
      generateArticleMiddleware,
      generateArticleRules,
      createRouteHandler(methods.generateArticle),
    )

    /**
     * @openapi
     * /article/batch-generate:
     *   post:
     *     security:
     *       - bearerAuth: []
     *     tags: [Article]
     *     produces:
     *       - application/json
     *     requestBody:
     *       required: true
     *       content:
     *         multipart/form-data:
     *           schema:
     *             type: object
     *             properties:
     *               articlesParams:
     *                 type: string
     *                 format: binary
     *               email:
     *                 type: string
     *                 format: email
     *     responses:
     *       200:
     *         description: Articles generation result
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 generatedArticlesIds:
     *                   type: array
     *                   items:
     *                     type: string
     */
    namespace.post(
      '/batch-generate',
      batchGenerateArticlesMiddleware,
      batchGenerateArticlesRules,
      createRouteHandler(methods.batchGenerateArticles),
    )

    /**
     * @openapi
     * /article/add-chapter:
     *   post:
     *     tags: [Article]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       in: body
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/rules/addChapter'
     *     responses:
     *       200:
     *         description: OK
     */
    namespace.post(
      '/generate-chapter',
      generateChapterRules,
      createRouteHandler(methods.generateChapter),
    )

    /**
     * @openapi
     * /article/{articleId}:
     *   get:
     *     security:
     *      - bearerAuth: []
     *     tags: [Article]
     *     parameters:
     *       - name: articleId
     *         in: path
     *         required: true
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: Article
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/entities/Article'
     */
    namespace.get('/:articleId', getArticleRules, createRouteHandler(methods.get))

    /**
     * @openapi
     * /article/{articleId}:
     *   patch:
     *     security:
     *      - bearerAuth: []
     *     tags: [Article]
     *     produces:
     *       - application/json
     *     requestBody:
     *       in: body
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/rules/updateArticle'
     *     parameters:
     *       - name: articleId
     *         in: path
     *         required: true
     *         type: string
     *     responses:
     *       200:
     *         description: Article
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/entities/Article'
     */
    namespace.patch('/:articleId', updateArticleRules, createRouteHandler(methods.update))

    /**
     * @openapi
     * /article/delete-many/:
     *   delete:
     *     security:
     *      - bearerAuth: []
     *     tags: [Article]
     *     produces:
     *       - application/json
     *     requestBody:
     *       in: body
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/rules/deleteManyArticles'
     *     responses:
     *       200:
     *         content:
     *           application/json:
     *             schema:
     *               type: string
     */
    namespace.delete(
      '/delete-many',
      deleteManyArticlesRules,
      createRouteHandler(methods.deleteMany),
    )
    /**
     * @openapi
     * /article/{articleId}:
     *   delete:
     *     security:
     *      - bearerAuth: []
     *     tags: [Article]
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: articleId
     *         in: path
     *         required: true
     *         type: string
     *     responses:
     *       200:
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/entities/Article'
     */
    namespace.delete('/:articleId', deleteArticleRules, createRouteHandler(methods.deleteArticle))

    root.use('/article', namespace)
  }
}

export const buildArticleHandler = (params: Params): IHandler => {
  const generateSubject = buildGenerateSubject(params)
  const generatePlan = buildGeneratePlan(params)
  const generatePlanHints = buildGeneratePlanHints(params)

  const generateArticle = buildGenerateArticle(params)
  const batchGenerateArticles = buildBatchGenerateArticles(params)
  const addChapterToPlan = buildAddChapterToPlan(params)
  const generateChapter = buildGenerateChapter(params)
  const get = buildGetArticle(params)
  const update = buildUpdateArticle(params)
  const deleteArticle = buildDeleteArticle(params)
  const deleteMany = buildDeleteMany(params)

  return {
    registerRoutes: buildRegisterRoutes(
      {
        generateSubject,
        generatePlan,
        generatePlanHints,
        addChapterToPlan,

        generateArticle,
        batchGenerateArticles,
        generateChapter,
        get,
        update,
        deleteArticle,
        deleteMany,
      },
      params.middlewares,
    ),
  }
}
