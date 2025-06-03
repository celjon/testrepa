import Express from 'express'
import { DeliveryParams } from '@/delivery/types'
import { IHandler } from '../types'
import { buildExcel, Excel } from './excel'
import { buildUserRules } from './rules'
import { Middlewares } from '../../middlewares'
import { createRouteHandler } from '../../routeHandler'
import { buildGetGroups, GetGroups } from './getGroups'
import { buildUpdate, Update } from './update'
import { buildGetPaymentMethods, GetPaymentMethods } from './getPaymentMethods'
import { buildUpdateRegion, UpdateRegion } from './updateRegion'
import { buildSendVerifyUpdating, SendVerifyUpdating } from './send-verify-updating'

type Params = Pick<DeliveryParams, 'user' | 'group' | 'middlewares'>

export type UserMethods = {
  excel: Excel
  groups: GetGroups
  update: Update
  sendVerifyUpdating: SendVerifyUpdating
  updateRegion: UpdateRegion
  getPaymentMethods: GetPaymentMethods
}

const buildRegisterRoutes = (methods: UserMethods, middlewares: Middlewares) => {
  const { getExcelRules, getGroupsRules, updateUserRules, updateRegionRules, sendVerifyUpdatingRules, getPaymentMethodsRules } =
    buildUserRules(middlewares)

  return (root: Express.Router) => {
    const namespace = Express.Router()

    namespace.get('/excel', getExcelRules, createRouteHandler(methods.excel))

    /**
     * @openapi
     * /user/groups:
     *   get:
     *     tags: [User]
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
     *                          type: array
     *                          items:
     *                            $ref: '#/components/entities/Group'
     *                        pages:
     *                          type: number
     */

    namespace.get('/groups', getGroupsRules, createRouteHandler(methods.groups))

    namespace.get('/send-verify-updating', sendVerifyUpdatingRules, createRouteHandler(methods.sendVerifyUpdating))

    namespace.patch('/', middlewares.fileUpload().single('file'), updateUserRules, createRouteHandler(methods.update))

    /**
     * @openapi
     * /user/region:
     *   patch:
     *     tags: [User]
     *     security:
     *      - bearerAuth: []
     *     produces:
     *       - application/json
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               region:
     *                 type: string
     *                 enum: [RU, KZ, OTHER]
     *     responses:
     *        200:
     *           content:
     *              application/json:
     *                schema:
     *                    $ref: '#/components/entities/User'
     */
    namespace.patch('/region', updateRegionRules, createRouteHandler(methods.updateRegion))

    /**
     * @openapi
     * /user/payment-methods:
     *   get:
     *     tags: [User]
     *     security:
     *      - bearerAuth: []
     *     produces:
     *       - application/json
     *     responses:
     *        200:
     *           content:
     *              application/json:
     *                schema:
     *                    properties:
     *                        region:
     *                          type: string
     *                          enum: [RU, KZ, OTHER]
     *                        paymentMethods:
     *                          type: array
     *                          items:
     *                            type: string
     *                            enum: [TINKOFF, KASPI, STRIPE, CRYPTO]
     */
    namespace.get('/payment-methods', getPaymentMethodsRules, createRouteHandler(methods.getPaymentMethods))

    root.use('/user', namespace)
  }
}

export const buildUserHandler = (params: Params): IHandler => {
  return {
    registerRoutes: buildRegisterRoutes(
      {
        excel: buildExcel(params),
        groups: buildGetGroups(params),
        update: buildUpdate(params),
        sendVerifyUpdating: buildSendVerifyUpdating(params),
        updateRegion: buildUpdateRegion(params),
        getPaymentMethods: buildGetPaymentMethods(params)
      },
      params.middlewares
    )
  }
}
