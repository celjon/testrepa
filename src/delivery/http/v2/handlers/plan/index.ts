import { buildBuy, Buy } from './buy'
import { buildList, List } from './list'
import { IHandler } from '../types'
import Express from 'express'
import { createRouteHandler } from '../../routeHandler'
import { buildPlanRules } from './rules'
import { DeliveryParams } from '@/delivery/types'
import { Middlewares } from '../../middlewares'

type Params = Pick<DeliveryParams, 'plan' | 'middlewares'>

export type PlanMethods = {
  buy: Buy
  list: List
}

const buildRegisterRoutes = (methods: PlanMethods, middlewares: Middlewares) => {
  const { buyPlanRules } = buildPlanRules(middlewares)

  return (root: Express.Router) => {
    const namespace = Express.Router()

    /**
     * @openapi
     * /plan/{id}/buy:
     *   post:
     *     tags: [Plan]
     *     security:
     *       - bearerAuth: []
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: id
     *         in: path
     *         required: true
     *         schema:
     *           type: string
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/rules/buyPlan'
     *     responses:
     *       200:
     *         description: Successfully initiated the payment.
     *         content:
     *           application/json:
     *             schema:
     *               properties:
     *                 url:
     *                   type: string
     *                   description: Payment URL
     */
    namespace.post('/:id/buy', buyPlanRules, createRouteHandler(methods.buy))

    /**
     * @openapi
     * /plan/list:
     *   get:
     *     tags: [Plan]
     *     produces:
     *       - application/json
     *     parameters:
     *      - name: includePlanModels
     *        in: query
     *        required: false
     *        type: boolean
     *      - name: currency
     *        in: query
     *        required: false
     *        type: string
     *     responses:
     *        200:
     *           content:
     *              application/json:
     *                schema:
     *                    type: array
     *                    items:
     *                       $ref: '#/components/entities/Plan'
     */

    namespace.get('/list', createRouteHandler(methods.list))

    root.use('/plan', namespace)
  }
}

export const buildPlanHandler = (params: Params): IHandler => {
  const buy = buildBuy(params)
  const list = buildList(params)

  return {
    registerRoutes: buildRegisterRoutes(
      {
        buy,
        list,
      },
      params.middlewares,
    ),
  }
}
