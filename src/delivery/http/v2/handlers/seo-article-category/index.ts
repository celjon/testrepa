import Express from 'express'
import { DeliveryParams } from '@/delivery/types'
import { createRouteHandler } from '../../routeHandler'
import { IHandler } from '../types'
import { buildSEOArticleCategoryRules } from './rules'
import { Middlewares } from '../../middlewares'
import { buildGetSEOArticleCategory, GetSEOArticleCategory } from './get'
import { buildUpdateSEOArticleCategory, UpdateSEOArticleCategory } from './update'
import { buildCreateSEOArticleCategory, CreateSEOArticleCategory } from './create'
import { buildDeleteSEOArticleCategory, DeleteSEOArticleCategory } from './delete'
import { buildListSEOArticleCategory, ListSEOArticlesCategory } from './list'

type Params = Pick<DeliveryParams, 'seoArticleCategory' | 'middlewares'>

type SEOArticleCategoryMethods = {
  getSEOArticleCategory: GetSEOArticleCategory
  listSEOArticleCategory: ListSEOArticlesCategory
  createSEOArticleCategory: CreateSEOArticleCategory
  updateSEOArticleCategory: UpdateSEOArticleCategory
  deleteSEOArticleCategory: DeleteSEOArticleCategory
}

const buildRegisterRoutes = (methods: SEOArticleCategoryMethods, middlewares: Middlewares) => {
  const {
    getSEOArticleCategoryRules,
    listSEOArticleCategoryRules,
    createSEOArticleCategoryRules,
    updateSEOArticleCategoryRules,
    deleteSEOArticleCategoryRules,
  } = buildSEOArticleCategoryRules(middlewares)
  return (root: Express.Router) => {
    const namespace = Express.Router()

    /**
     * @openapi
     * /seo-article-category/get-by-id/{seoArticleCategoryId}:
     *   get:
     *     security:
     *      - bearerAuth: []
     *     tags: [SEO Article Category]
     *     parameters:
     *       - name: seoArticleCategoryId
     *         in: path
     *         required: true
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: Category
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/entities/SEOArticleCategory'
     */
    namespace.get(
      '/get-by-id/:seoArticleCategoryId',
      getSEOArticleCategoryRules,
      createRouteHandler(methods.getSEOArticleCategory),
    )

    /**
     * @openapi
     * /seo-article-category/list:
     *   get:
     *     security:
     *       - bearerAuth: []
     *     tags: [SEO Article Category]
     *     parameters:
     *       - name: page
     *         in: query
     *         schema:
     *           type: number
     *       - name: quantity
     *         in: query
     *         schema:
     *           type: number
     *     responses:
     *       200:
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 data:
     *                   type: array
     *                   items:
     *                     $ref: '#/components/entities/SEOArticleCategory'
     *                 pages:
     *                   type: integer
     *                 count:
     *                   type: integer
     */
    namespace.get(
      '/list',
      listSEOArticleCategoryRules,
      createRouteHandler(methods.listSEOArticleCategory),
    )
    /**
     * @openapi
     * /seo-article-category/create:
     *   post:
     *     security:
     *      - bearerAuth: []
     *     tags: [SEO Article Category]
     *     produces:
     *       - application/json
     *     requestBody:
     *       in: body
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/rules/createSEOArticleCategory'
     *
     *     responses:
     *       200:
     *         description: SEOArticleCategory
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/entities/SEOArticleCategory'
     */
    namespace.post(
      '/create',
      createSEOArticleCategoryRules,
      createRouteHandler(methods.createSEOArticleCategory),
    )

    /**
     * @openapi
     * /seo-article-category/{seoArticleCategoryId}:
     *   patch:
     *     security:
     *      - bearerAuth: []
     *     tags: [SEO Article Category]
     *     produces:
     *       - application/json
     *     requestBody:
     *       in: body
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/rules/updateSEOArticleCategory'
     *     parameters:
     *       - name: seoArticleCategoryId
     *         in: path
     *         required: true
     *         type: string
     *     responses:
     *       200:
     *         description: SEOArticleCategory
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/entities/SEOArticleCategory'
     */
    namespace.patch(
      '/:seoArticleCategoryId',
      updateSEOArticleCategoryRules,
      createRouteHandler(methods.updateSEOArticleCategory),
    )

    /**
     * @openapi
     * /seo-article-category/{seoArticleCategoryId}:
     *   delete:
     *     security:
     *      - bearerAuth: []
     *     tags: [SEO Article Category]
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: seoArticleCategoryId
     *         in: path
     *         required: true
     *         type: string
     *     responses:
     *       200:
     *         description: SEOArticleCategory
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/entities/SEOArticleCategory'
     */
    namespace.delete(
      '/:seoArticleCategoryId',
      deleteSEOArticleCategoryRules,
      createRouteHandler(methods.deleteSEOArticleCategory),
    )

    root.use('/seo-article-category', namespace)
  }
}

export const buildSEOArticleCategoryHandler = (params: Params): IHandler => {
  const getSEOArticleCategory = buildGetSEOArticleCategory(params)
  const listSEOArticleCategory = buildListSEOArticleCategory(params)
  const createSEOArticleCategory = buildCreateSEOArticleCategory(params)
  const updateSEOArticleCategory = buildUpdateSEOArticleCategory(params)
  const deleteSEOArticleCategory = buildDeleteSEOArticleCategory(params)

  return {
    registerRoutes: buildRegisterRoutes(
      {
        getSEOArticleCategory,
        listSEOArticleCategory,
        createSEOArticleCategory,
        updateSEOArticleCategory,
        deleteSEOArticleCategory,
      },
      params.middlewares,
    ),
  }
}
