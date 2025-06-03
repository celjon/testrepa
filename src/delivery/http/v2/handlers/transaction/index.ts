import { buildList, List } from './list'
import { buildExcel, Excel } from './excel'
import { buildListWithdraw, ListWithdraw } from './listWithdraw'
import { buildReject, Reject } from './reject'
import { buildSubmit, Submit } from './submit'
import { IHandler } from '../types'
import { createRouteHandler } from '../../routeHandler'
import { Middlewares } from '../../middlewares'
import Express from 'express'
import { DeliveryParams } from '@/delivery/types'
import { buildTransactionRules } from './rules'

type Params = Pick<DeliveryParams, 'transaction' | 'middlewares'>

export type TransactionMethods = {
  list: List
  excel: Excel
  listWithdraw: ListWithdraw
  reject: Reject
  submit: Submit
}

const buildRegisterRoutes = (methods: TransactionMethods, middlewares: Middlewares) => {
  const { listTransactionsRules } = buildTransactionRules(middlewares)
  const { authRequired } = middlewares

  return (root: Express.Router) => {
    const namespace = Express.Router()

    /**
     * @openapi
     * /transaction/list:
     *   get:
     *     tags: [Transaction]
     *     security:
     *      - bearerAuth: []
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: page
     *         in: query
     *         type: number
     *     responses:
     *        200:
     *           content:
     *              application/json:
     *                schema:
     *                    properties:
     *                        data:
     *                           type: array
     *                           items:
     *                              $ref: '#/components/entities/Transaction'
     *                        pages:
     *                          type: number
     */
    namespace.get('/list', listTransactionsRules, createRouteHandler(methods.list))
    namespace.get('/excel', authRequired(), createRouteHandler(methods.excel))
    namespace.get('/list-withdraw', authRequired(), createRouteHandler(methods.listWithdraw))
    namespace.get('/:id/submit', authRequired(), createRouteHandler(methods.submit))
    namespace.get('/:id/reject', authRequired(), createRouteHandler(methods.reject))
    root.use('/transaction', namespace)
  }
}

export const buildTransactionHandler = (params: Params): IHandler => {
  const list = buildList(params)
  const excel = buildExcel(params)
  const listWithdraw = buildListWithdraw(params)
  const reject = buildReject(params)
  const submit = buildSubmit(params)

  return {
    registerRoutes: buildRegisterRoutes(
      {
        list,
        excel,
        listWithdraw,
        reject,
        submit
      },
      params.middlewares
    )
  }
}
