import { IHandler } from '../types'
import { buildList, List } from './list'
import Express from 'express'
import { createRouteHandler } from '../../routeHandler'
import { buildReferralTemplateRules } from './rules'
import { DeliveryParams } from '@/delivery/types'
import { Middlewares } from '../../middlewares'

type Params = Pick<DeliveryParams, 'referralTemplate' | 'middlewares'>

export type ReferralTemplateMethods = {
  list: List
}

const buildRegisterRoutes = (methods: ReferralTemplateMethods, middlewares: Middlewares) => {
  const { listRules } = buildReferralTemplateRules(middlewares)

  return (root: Express.Router) => {
    const namespace = Express.Router()

    /**
     * @openapi
     * /referral-template/list:
     *   get:
     *     tags: [Referral Template]
     *     security:
     *      - bearerAuth: []
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: page
     *         in: query
     *         required: false
     *         type: number
     *       - name: search
     *         in: query
     *         required: false
     *         type: string
     *       - name: locale
     *         in: query
     *         required: false
     *         type: string
     *     responses:
     *       200:
     *         content:
     *           application/json:
     *             schema:
     *               properties:
     *                 data:
     *                   type: array
     *                   items:
     *                     $ref: '#/components/entities/ReferralTemplate'
     *                 pages:
     *                   type: number
     */
    namespace.get('/list', listRules, createRouteHandler(methods.list))
    root.use('/referral-template', namespace)
  }
}

export const buildReferralTemplateHandler = (params: Params): IHandler => {
  const list = buildList(params)
  return {
    registerRoutes: buildRegisterRoutes(
      {
        list,
      },
      params.middlewares,
    ),
  }
}
