import Express from 'express'
import { DeliveryParams } from '@/delivery/types'
import { createRouteHandler } from '../../routeHandler'
import { IHandler } from '../types'
import { buildSEOArticleProofreadingRules } from './rules'
import { Middlewares } from '../../middlewares'
import { buildGetSEOArticleProofreading, GetSEOArticleProofreading } from './get'
import { buildUpdateSEOArticleProofreading, UpdateSEOArticleProofreading } from './update'
import { buildCreateSEOArticleProofreading, CreateSEOArticleProofreading } from './create'
import { buildDeleteSEOArticleProofreading, DeleteSEOArticleProofreading } from './delete'
import { buildCreateManySEOArticleProofreading, CreateManySEOArticleProofreading } from './create-many'

type Params = Pick<DeliveryParams, 'seoArticleProofreading' | 'middlewares'>

type SEOArticleProofreadingMethods = {
  getSEOArticleProofreading: GetSEOArticleProofreading
  createSEOArticleProofreading: CreateSEOArticleProofreading
  createManySEOArticleProofreading: CreateManySEOArticleProofreading
  updateSEOArticleProofreading: UpdateSEOArticleProofreading
  deleteSEOArticleProofreading: DeleteSEOArticleProofreading
}

const buildRegisterRoutes = (methods: SEOArticleProofreadingMethods, middlewares: Middlewares) => {
  const {
    getSEOArticleProofreadingRules,
    createSEOArticleProofreadingRules,
    createManySEOArticleProofreadingRules,
    updateSEOArticleProofreadingRules,
    deleteSEOArticleProofreadingRules
  } = buildSEOArticleProofreadingRules(middlewares)
  return (root: Express.Router) => {
    const namespace = Express.Router()

    /**
     * @openapi
     * /seo-article-proofreading/{seoArticleProofreadingId}:
     *   get:
     *     security:
     *      - bearerAuth: []
     *     tags: [SEO Article Proofreading]
     *     parameters:
     *       - name: seoArticleProofreadingId
     *         in: path
     *         required: true
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: Proofreading
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/entities/SEOArticleProofreading'
     */
    namespace.get('/:seoArticleProofreadingId', getSEOArticleProofreadingRules, createRouteHandler(methods.getSEOArticleProofreading))

    /**
     * @openapi
     * /seo-article-proofreading/create:
     *   post:
     *     security:
     *      - bearerAuth: []
     *     tags: [SEO Article Proofreading]
     *     produces:
     *       - application/json
     *     requestBody:
     *       in: body
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/rules/createSEOArticleProofreading'
     *
     *     responses:
     *       200:
     *         description: SEOArticleProofreading
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/entities/SEOArticleProofreading'
     */
    namespace.post('/create', createSEOArticleProofreadingRules, createRouteHandler(methods.createSEOArticleProofreading))

    /**
     * @openapi
     * /seo-article-proofreading/create-many:
     *   post:
     *     security:
     *      - bearerAuth: []
     *     tags: [SEO Article Proofreading]
     *     produces:
     *       - application/json
     *     requestBody:
     *       in: body
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/rules/createManySEOArticleProofreading'
     *
     *     responses:
     *       200:
     *         description: SEOArticleProofreading
     *         content:
     *           application/json:
     *             schema:
     *               type: string
     */
    namespace.post('/create-many', createManySEOArticleProofreadingRules, createRouteHandler(methods.createManySEOArticleProofreading))

    /**
     * @openapi
     * /seo-article-proofreading/{seoArticleProofreadingId}:
     *   patch:
     *     security:
     *      - bearerAuth: []
     *     tags: [SEO Article Proofreading]
     *     produces:
     *       - application/json
     *     requestBody:
     *       in: body
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/rules/updateSEOArticleProofreading'
     *     parameters:
     *       - name: seoArticleProofreadingId
     *         in: path
     *         required: true
     *         type: string
     *     responses:
     *       200:
     *         description: SEOArticleProofreading
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/entities/SEOArticleProofreading'
     */
    namespace.patch(
      '/:seoArticleProofreadingId',
      updateSEOArticleProofreadingRules,
      createRouteHandler(methods.updateSEOArticleProofreading)
    )

    /**
     * @openapi
     * /seo-article-proofreading/{seoArticleProofreadingId}:
     *   delete:
     *     security:
     *      - bearerAuth: []
     *     tags: [SEO Article Proofreading]
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: seoArticleProofreadingId
     *         in: path
     *         required: true
     *         type: string
     *     responses:
     *       200:
     *         description: SEOArticleProofreading
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/entities/SEOArticleProofreading'
     */
    namespace.delete(
      '/:seoArticleProofreadingId',
      deleteSEOArticleProofreadingRules,
      createRouteHandler(methods.deleteSEOArticleProofreading)
    )

    root.use('/seo-article-proofreading', namespace)
  }
}

export const buildSEOArticleProofreadingHandler = (params: Params): IHandler => {
  const getSEOArticleProofreading = buildGetSEOArticleProofreading(params)
  const createSEOArticleProofreading = buildCreateSEOArticleProofreading(params)
  const createManySEOArticleProofreading = buildCreateManySEOArticleProofreading(params)
  const updateSEOArticleProofreading = buildUpdateSEOArticleProofreading(params)
  const deleteSEOArticleProofreading = buildDeleteSEOArticleProofreading(params)

  return {
    registerRoutes: buildRegisterRoutes(
      {
        getSEOArticleProofreading,
        createSEOArticleProofreading,
        createManySEOArticleProofreading,
        updateSEOArticleProofreading,
        deleteSEOArticleProofreading
      },
      params.middlewares
    )
  }
}
