import Express from 'express'
import { DeliveryParams } from '@/delivery/types'
import { createRouteHandler } from '../../routeHandler'
import { IHandler } from '../types'
import { buildExchangeRateRules } from './rules'
import { Middlewares } from '../../middlewares'
import { buildGetExchangeRate, GetExchangeRate } from './get'
import { buildUpdateExchangeRate, UpdateExchangeRate } from './update'
import { buildCreateExchangeRate, CreateExchangeRate } from './create'
import { buildDeleteExchangeRate, DeleteExchangeRate } from './delete'
import { buildListExchangeRates, ListExchangeRates } from './list'

type Params = Pick<DeliveryParams, 'exchangeRate' | 'middlewares'>

type ExchangeRateMethods = {
  getExchangeRate: GetExchangeRate
  listExchangeRates: ListExchangeRates
  createExchangeRate: CreateExchangeRate
  updateExchangeRate: UpdateExchangeRate
  deleteExchangeRate: DeleteExchangeRate
}

const buildRegisterRoutes = (methods: ExchangeRateMethods, middlewares: Middlewares) => {
  const {
    getExchangeRateRules,
    listExchangeRatesRules,
    createExchangeRateRules,
    updateExchangeRateRules,
    deleteExchangeRateRules,
  } = buildExchangeRateRules(middlewares)

  return (root: Express.Router) => {
    const namespace = Express.Router()

    /**
     * @openapi
     * /exchange-rate/{exchangeRateId}:
     *   get:
     *     security:
     *      - bearerAuth: []
     *     tags: [Exchange Rate]
     *     parameters:
     *       - name: exchangeRateId
     *         in: path
     *         required: true
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: ExchangeRate
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/entities/ExchangeRate'
     */
    namespace.get(
      '/:exchangeRateId',
      getExchangeRateRules,
      createRouteHandler(methods.getExchangeRate),
    )

    /**
     * @openapi
     * /exchange-rate:
     *   get:
     *     security:
     *      - bearerAuth: []
     *     tags: [Exchange Rate]
     *     parameters:
     *       - name: amount
     *         in: query
     *         required: false
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: ExchangeRate
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/entities/ExchangeRate'
     */

    namespace.get('/', listExchangeRatesRules, createRouteHandler(methods.listExchangeRates))

    /**
     * @openapi
     * /exchange-rate:
     *   post:
     *     security:
     *      - bearerAuth: []
     *     tags: [Exchange Rate]
     *     produces:
     *       - application/json
     *     requestBody:
     *       in: body
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/rules/createExchangeRate'
     *
     *     responses:
     *       200:
     *         description: ExchangeRate
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/entities/ExchangeRate'
     */
    namespace.post('/', createExchangeRateRules, createRouteHandler(methods.createExchangeRate))

    /**
     * @openapi
     * /exchange-rate/{exchangeRateId}:
     *   patch:
     *     security:
     *      - bearerAuth: []
     *     tags: [Exchange Rate]
     *     produces:
     *       - application/json
     *     requestBody:
     *       in: body
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/rules/updateExchangeRate'
     *     parameters:
     *       - name: exchangeRateId
     *         in: path
     *         required: true
     *         type: string
     *     responses:
     *       200:
     *         description: ExchangeRate
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/entities/ExchangeRate'
     */
    namespace.patch(
      '/:exchangeRateId',
      updateExchangeRateRules,
      createRouteHandler(methods.updateExchangeRate),
    )

    /**
     * @openapi
     * /exchange-rate/{exchangeRateId}:
     *   delete:
     *     security:
     *      - bearerAuth: []
     *     tags: [Exchange Rate]
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: exchangeRateId
     *         in: path
     *         required: true
     *         type: string
     *     responses:
     *       200:
     *         description: ExchangeRate
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/entities/ExchangeRate'
     */
    namespace.delete(
      '/:exchangeRateId',
      deleteExchangeRateRules,
      createRouteHandler(methods.deleteExchangeRate),
    )

    root.use('/exchange-rate', namespace)
  }
}

export const buildExchangeRateHandler = (params: Params): IHandler => {
  const getExchangeRate = buildGetExchangeRate(params)
  const listExchangeRates = buildListExchangeRates(params)
  const createExchangeRate = buildCreateExchangeRate(params)
  const updateExchangeRate = buildUpdateExchangeRate(params)
  const deleteExchangeRate = buildDeleteExchangeRate(params)

  return {
    registerRoutes: buildRegisterRoutes(
      {
        getExchangeRate,
        listExchangeRates,
        createExchangeRate,
        updateExchangeRate,
        deleteExchangeRate,
      },
      params.middlewares,
    ),
  }
}
