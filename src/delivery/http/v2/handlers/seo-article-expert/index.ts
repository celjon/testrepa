import Express from 'express'
import { DeliveryParams } from '@/delivery/types'
import { createRouteHandler } from '../../routeHandler'
import { IHandler } from '../types'
import { buildSEOArticleExpertRules } from './rules'
import { Middlewares } from '../../middlewares'
import { buildGetSEOArticleExpert, GetSEOArticleExpert } from './get'
import { buildUpdateSEOArticleExpert, UpdateSEOArticleExpert } from './update'
import { buildCreateSEOArticleExpert, CreateSEOArticleExpert } from './create'
import { buildDeleteSEOArticleExpert, DeleteSEOArticleExpert } from './delete'
import { buildFindBySlug, FindBySlug } from './find-by-slug'

type Params = Pick<DeliveryParams, 'seoArticleExpert' | 'middlewares'>

type SEOArticleExpertMethods = {
  getSEOArticleExpert: GetSEOArticleExpert
  findBySlug: FindBySlug
  createSEOArticleExpert: CreateSEOArticleExpert
  updateSEOArticleExpert: UpdateSEOArticleExpert
  deleteSEOArticleExpert: DeleteSEOArticleExpert
}

const buildRegisterRoutes = (methods: SEOArticleExpertMethods, middlewares: Middlewares) => {
  const {
    getSEOArticleExpertRules,
    findBySlugRules,
    createSEOArticleExpertRules,
    updateSEOArticleExpertRules,
    deleteSEOArticleExpertRules,
  } = buildSEOArticleExpertRules(middlewares)
  return (root: Express.Router) => {
    const namespace = Express.Router()

    /**
     * @openapi
     * /seo-article-expert/{seoExpertId}:
     *   get:
     *     security:
     *      - bearerAuth: []
     *     tags: [SEO Article Expert]
     *     parameters:
     *       - name: seoExpertId
     *         in: path
     *         required: true
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: Expert
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/entities/SEOArticleExpert'
     */
    namespace.get(
      '/:seoExpertId',
      getSEOArticleExpertRules,
      createRouteHandler(methods.getSEOArticleExpert),
    )

    /**
     * @openapi
     * /seo-article-expert/find-by-slug/{slug}:
     *   get:
     *     tags: [SEO Article Expert]
     *     parameters:
     *       - name: slug
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
     *               $ref: '#/components/entities/SEOArticleExpert'
     */
    namespace.get('/find-by-slug/:slug', findBySlugRules, createRouteHandler(methods.findBySlug))

    /**
     * @openapi
     * /seo-article-expert/create:
     *   post:
     *     security:
     *      - bearerAuth: []
     *     tags: [SEO Article Expert]
     *     produces:
     *       - application/json
     *     requestBody:
     *       in: body
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/rules/createSEOArticleExpert'
     *
     *     responses:
     *       200:
     *         description: SEOArticleExpert
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/entities/SEOArticleExpert'
     */
    namespace.post(
      '/create',
      createSEOArticleExpertRules,
      createRouteHandler(methods.createSEOArticleExpert),
    )

    /**
     * @openapi
     * /seo-article-expert/{seoExpertId}:
     *   patch:
     *     security:
     *      - bearerAuth: []
     *     tags: [SEO Article Expert]
     *     produces:
     *       - application/json
     *     requestBody:
     *       in: body
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/rules/updateSEOArticleExpert'
     *     parameters:
     *       - name: seoExpertId
     *         in: path
     *         required: true
     *         type: string
     *     responses:
     *       200:
     *         description: SEOArticleExpert
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/entities/SEOArticleExpert'
     */
    namespace.patch(
      '/:seoExpertId',
      updateSEOArticleExpertRules,
      createRouteHandler(methods.updateSEOArticleExpert),
    )

    /**
     * @openapi
     * /seo-article-expert/{seoExpertId}:
     *   delete:
     *     security:
     *      - bearerAuth: []
     *     tags: [SEO Article Expert]
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: seoExpertId
     *         in: path
     *         required: true
     *         type: string
     *     responses:
     *       200:
     *         description: SEOArticleExpert
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/entities/SEOArticleExpert'
     */
    namespace.delete(
      '/:seoExpertId',
      deleteSEOArticleExpertRules,
      createRouteHandler(methods.deleteSEOArticleExpert),
    )

    root.use('/seo-article-expert', namespace)
  }
}

export const buildSEOArticleExpertHandler = (params: Params): IHandler => {
  const getSEOArticleExpert = buildGetSEOArticleExpert(params)
  const findBySlug = buildFindBySlug(params)
  const createSEOArticleExpert = buildCreateSEOArticleExpert(params)
  const updateSEOArticleExpert = buildUpdateSEOArticleExpert(params)
  const deleteSEOArticleExpert = buildDeleteSEOArticleExpert(params)

  return {
    registerRoutes: buildRegisterRoutes(
      {
        getSEOArticleExpert,
        findBySlug,
        createSEOArticleExpert,
        updateSEOArticleExpert,
        deleteSEOArticleExpert,
      },
      params.middlewares,
    ),
  }
}
