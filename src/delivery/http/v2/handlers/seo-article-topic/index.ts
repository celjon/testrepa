import Express from 'express'
import { DeliveryParams } from '@/delivery/types'
import { createRouteHandler } from '../../routeHandler'
import { IHandler } from '../types'
import { buildSEOArticleTopicRules } from './rules'
import { Middlewares } from '../../middlewares'
import { buildGetSEOArticleTopic, GetSEOArticleTopic } from './get'
import { buildUpdateSEOArticleTopic, UpdateSEOArticleTopic } from './update'
import { buildCreateSEOArticleTopic, CreateSEOArticleTopic } from '@/delivery/http/v2/handlers/seo-article-topic/create'
import { buildDeleteSEOArticleTopic, DeleteSEOArticleTopic } from '@/delivery/http/v2/handlers/seo-article-topic/delete'

type Params = Pick<DeliveryParams, 'seoArticleTopic' | 'middlewares'>

type SEOArticleTopicMethods = {
  getSEOArticleTopic: GetSEOArticleTopic
  createSEOArticleTopic: CreateSEOArticleTopic
  updateSEOArticleTopic: UpdateSEOArticleTopic
  deleteSEOArticleTopic: DeleteSEOArticleTopic
}

const buildRegisterRoutes = (methods: SEOArticleTopicMethods, middlewares: Middlewares) => {
  const { getSEOArticleTopicRules, createSEOArticleTopicRules, updateSEOArticleTopicRules, deleteSEOArticleTopicRules } =
    buildSEOArticleTopicRules(middlewares)
  return (root: Express.Router) => {
    const namespace = Express.Router()

    /**
     * @openapi
     * /seo-article-topic/{seoArticleTopicId}:
     *   get:
     *     security:
     *      - bearerAuth: []
     *     tags: [SEO Article Topic]
     *     parameters:
     *       - name: seoArticleTopicId
     *         in: path
     *         required: true
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: Topic
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/entities/SEOArticleTopic'
     */
    namespace.get('/:seoArticleTopicId', getSEOArticleTopicRules, createRouteHandler(methods.getSEOArticleTopic))

    /**
     * @openapi
     * /seo-article-topic/create:
     *   post:
     *     security:
     *      - bearerAuth: []
     *     tags: [SEO Article Topic]
     *     produces:
     *       - application/json
     *     requestBody:
     *       in: body
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/rules/createSEOArticleTopic'
     *
     *     responses:
     *       200:
     *         description: SEOArticleTopic
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/entities/SEOArticleTopic'
     */
    namespace.post('/create', createSEOArticleTopicRules, createRouteHandler(methods.createSEOArticleTopic))

    /**
     * @openapi
     * /seo-article-topic/{seoArticleTopicId}:
     *   patch:
     *     security:
     *      - bearerAuth: []
     *     tags: [SEO Article Topic]
     *     produces:
     *       - application/json
     *     requestBody:
     *       in: body
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/rules/updateSEOArticleTopic'
     *     parameters:
     *       - name: seoArticleTopicId
     *         in: path
     *         required: true
     *         type: string
     *     responses:
     *       200:
     *         description: SEOArticleTopic
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/entities/SEOArticleTopic'
     */
    namespace.patch('/:seoArticleTopicId', updateSEOArticleTopicRules, createRouteHandler(methods.updateSEOArticleTopic))

    /**
     * @openapi
     * /seo-article-topic/{seoArticleTopicId}:
     *   delete:
     *     security:
     *      - bearerAuth: []
     *     tags: [SEO Article Topic]
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: seoArticleTopicId
     *         in: path
     *         required: true
     *         type: string
     *     responses:
     *       200:
     *         description: SEOArticleTopic
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/entities/SEOArticleTopic'
     */
    namespace.delete('/:seoArticleTopicId', deleteSEOArticleTopicRules, createRouteHandler(methods.deleteSEOArticleTopic))

    root.use('/seo-article-topic', namespace)
  }
}

export const buildSEOArticleTopicHandler = (params: Params): IHandler => {
  const getSEOArticleTopic = buildGetSEOArticleTopic(params)
  const createSEOArticleTopic = buildCreateSEOArticleTopic(params)
  const updateSEOArticleTopic = buildUpdateSEOArticleTopic(params)
  const deleteSEOArticleTopic = buildDeleteSEOArticleTopic(params)

  return {
    registerRoutes: buildRegisterRoutes(
      {
        getSEOArticleTopic,
        createSEOArticleTopic,
        updateSEOArticleTopic,
        deleteSEOArticleTopic
      },
      params.middlewares
    )
  }
}
