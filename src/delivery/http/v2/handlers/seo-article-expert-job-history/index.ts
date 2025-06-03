import Express from 'express'
import { DeliveryParams } from '@/delivery/types'
import { createRouteHandler } from '../../routeHandler'
import { IHandler } from '../types'
import { buildSEOArticleExpertJobHistoryRules } from './rules'
import { Middlewares } from '../../middlewares'
import { buildGetSEOArticleExpertJobHistory, GetSEOArticleExpertJobHistory } from './get'
import { buildUpdateSEOArticleExpertJobHistory, UpdateSEOArticleExpertJobHistory } from './update'
import {
  buildCreateSEOArticleExpertJobHistory,
  CreateSEOArticleExpertJobHistory
} from '@/delivery/http/v2/handlers/seo-article-expert-job-history/create'
import {
  buildDeleteSEOArticleExpertJobHistory,
  DeleteSEOArticleExpertJobHistory
} from '@/delivery/http/v2/handlers/seo-article-expert-job-history/delete'

type Params = Pick<DeliveryParams, 'seoArticleExpertJobHistory' | 'middlewares'>

type SEOArticleExpertJobHistoryMethods = {
  getSEOArticleExpertJobHistory: GetSEOArticleExpertJobHistory
  createSEOArticleExpertJobHistory: CreateSEOArticleExpertJobHistory
  updateSEOArticleExpertJobHistory: UpdateSEOArticleExpertJobHistory
  deleteSEOArticleExpertJobHistory: DeleteSEOArticleExpertJobHistory
}

const buildRegisterRoutes = (methods: SEOArticleExpertJobHistoryMethods, middlewares: Middlewares) => {
  const {
    getSEOArticleExpertJobHistoryRules,
    createSEOArticleExpertJobHistoryRules,
    updateSEOArticleExpertJobHistoryRules,
    deleteSEOArticleExpertJobHistoryRules
  } = buildSEOArticleExpertJobHistoryRules(middlewares)
  return (root: Express.Router) => {
    const namespace = Express.Router()

    /**
     * @openapi
     * /seo-article-expert-job-history/{seoArticleExpertJobHistoryId}:
     *   get:
     *     security:
     *      - bearerAuth: []
     *     tags: [SEO Article Expert Job History]
     *     parameters:
     *       - name: seoArticleExpertJobHistoryId
     *         in: path
     *         required: true
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: ExpertJobHistory
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/entities/SEOArticleExpertJobHistory'
     */
    namespace.get(
      '/:seoArticleExpertJobHistoryId',
      getSEOArticleExpertJobHistoryRules,
      createRouteHandler(methods.getSEOArticleExpertJobHistory)
    )

    /**
     * @openapi
     * /seo-article-expert-job-history/create:
     *   post:
     *     security:
     *      - bearerAuth: []
     *     tags: [SEO Article Expert Job History]
     *     produces:
     *       - application/json
     *     requestBody:
     *       in: body
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/rules/createSEOArticleExpertJobHistory'
     *
     *     responses:
     *       200:
     *         description: SEOArticleExpertJobHistory
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/entities/SEOArticleExpertJobHistory'
     */
    namespace.post('/create', createSEOArticleExpertJobHistoryRules, createRouteHandler(methods.createSEOArticleExpertJobHistory))

    /**
     * @openapi
     * /seo-article-expert-job-history/{seoArticleExpertJobHistoryId}:
     *   patch:
     *     security:
     *      - bearerAuth: []
     *     tags: [SEO Article Expert Job History]
     *     produces:
     *       - application/json
     *     requestBody:
     *       in: body
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/rules/updateSEOArticleExpertJobHistory'
     *     parameters:
     *       - name: seoArticleExpertJobHistoryId
     *         in: path
     *         required: true
     *         type: string
     *     responses:
     *       200:
     *         description: SEOArticleExpertJobHistory
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/entities/SEOArticleExpertJobHistory'
     */
    namespace.patch(
      '/:seoArticleExpertJobHistoryId',
      updateSEOArticleExpertJobHistoryRules,
      createRouteHandler(methods.updateSEOArticleExpertJobHistory)
    )

    /**
     * @openapi
     * /seo-article-expert-job-history/{seoArticleExpertJobHistoryId}:
     *   delete:
     *     security:
     *      - bearerAuth: []
     *     tags: [SEO Article Expert Job History]
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: seoArticleExpertJobHistoryId
     *         in: path
     *         required: true
     *         type: string
     *     responses:
     *       200:
     *         description: SEOArticleExpertJobHistory
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/entities/SEOArticleExpertJobHistory'
     */
    namespace.delete(
      '/:seoArticleExpertJobHistoryId',
      deleteSEOArticleExpertJobHistoryRules,
      createRouteHandler(methods.deleteSEOArticleExpertJobHistory)
    )

    root.use('/seo-article-expert-job-history', namespace)
  }
}

export const buildSEOArticleExpertJobHistoryHandler = (params: Params): IHandler => {
  const getSEOArticleExpertJobHistory = buildGetSEOArticleExpertJobHistory(params)
  const createSEOArticleExpertJobHistory = buildCreateSEOArticleExpertJobHistory(params)
  const updateSEOArticleExpertJobHistory = buildUpdateSEOArticleExpertJobHistory(params)
  const deleteSEOArticleExpertJobHistory = buildDeleteSEOArticleExpertJobHistory(params)

  return {
    registerRoutes: buildRegisterRoutes(
      {
        getSEOArticleExpertJobHistory,
        createSEOArticleExpertJobHistory,
        updateSEOArticleExpertJobHistory,
        deleteSEOArticleExpertJobHistory
      },
      params.middlewares
    )
  }
}
