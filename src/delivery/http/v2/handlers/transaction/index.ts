import { buildList, List } from './list'
import { buildExcel, Excel } from './excel'
import { buildListWithdraw, ListWithdraw } from './list-withdraw'
import { buildReject, Reject } from './reject'
import { buildSubmit, Submit } from './submit'
import { IHandler } from '../types'
import { createRouteHandler } from '../../routeHandler'
import { Middlewares } from '../../middlewares'
import Express from 'express'
import { DeliveryParams } from '@/delivery/types'
import { buildTransactionRules } from './rules'
import {
  buildExcelGroupedByDeveloperKey,
  ExcelGroupedByDeveloperKey,
} from './excel-grouped-by-developer-key-label'

type Params = Pick<DeliveryParams, 'transaction' | 'middlewares'>

export type TransactionMethods = {
  list: List
  excel: Excel
  listWithdraw: ListWithdraw
  reject: Reject
  submit: Submit
  excelGroupedByDeveloperKey: ExcelGroupedByDeveloperKey
}

const buildRegisterRoutes = (methods: TransactionMethods, middlewares: Middlewares) => {
  const { listTransactionsRules, excelGroupedByDeveloperKeyRules } =
    buildTransactionRules(middlewares)
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
     *       - name: withDeveloperKey
     *         in: query
     *         type: boolean
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
    /**
     * @openapi
     * /transaction/excel-grouped-by-developer-key-label:
     *   get:
     *     tags: [Transaction]
     *     security:
     *       - bearerAuth: []
     *     summary: Экспорт агрегированных трат пользователя по developerKeyId в формате Excel
     *     parameters:
     *       - name: from
     *         in: query
     *         description: Начальная дата (включительно) в формате YYYY-MM-DD или ISO 8601. Если не передана, по умолчанию берётся текущая дата.
     *         required: false
     *         schema:
     *           type: string
     *           format: date
     *           example: "2025-06-01"
     *       - name: to
     *         in: query
     *         description: Конечная дата (включительно) в формате YYYY-MM-DD или ISO 8601. Если не передана, по умолчанию берётся текущая дата.
     *         required: false
     *         schema:
     *           type: string
     *           format: date
     *           example: "2025-06-10"
     *     responses:
     *       200:
     *         description: Excel-файл с агрегированной статистикой трат пользователя по developerKeyId.
     *         content:
     *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
     *             schema:
     *               type: string
     *               format: binary
     */
    namespace.get(
      '/excel-grouped-by-developer-key-label',
      excelGroupedByDeveloperKeyRules,
      createRouteHandler(methods.excelGroupedByDeveloperKey),
    )

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
  const excelGroupedByDeveloperKey = buildExcelGroupedByDeveloperKey(params)

  return {
    registerRoutes: buildRegisterRoutes(
      {
        list,
        excel,
        listWithdraw,
        reject,
        submit,
        excelGroupedByDeveloperKey,
      },
      params.middlewares,
    ),
  }
}
