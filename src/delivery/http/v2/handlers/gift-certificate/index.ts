import Express from 'express'
import { DeliveryParams } from '@/delivery/types'
import { IHandler } from '../types'
import { buildGiftCertificateRules } from './rules'
import { Middlewares } from '../../middlewares'
import { createRouteHandler } from '../../routeHandler'
import { buildCreate, Create } from './create'
import { buildActivate, Activate } from './activate'

type Params = Pick<DeliveryParams, 'giftCertificate' | 'middlewares'>

export type GiftCertificateMethods = {
  create: Create
  activate: Activate
}

const buildRegisterRoutes = (methods: GiftCertificateMethods, middlewares: Middlewares) => {
  const { createRules, activateRules } = buildGiftCertificateRules(middlewares)

  return (root: Express.Router) => {
    const namespace = Express.Router()

    /**
     * @openapi
     * /gift-certificate/create:
     *   post:
     *     tags: [Gift Certificate]
     *     security:
     *      - bearerAuth: []
     *     produces:
     *       - application/json
     *     requestBody:
     *       in: body
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/rules/create'
     *     responses:
     *       200:
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *             required:
     *               - amount
     *             properties:
     *               amount:
     *                 type: string
     */
    namespace.post('/create', createRules, createRouteHandler(methods.create))

    /**
     * @openapi
     * /gift-certificate/activate:
     *   post:
     *     tags: [Gift Certificate]
     *     security:
     *      - bearerAuth: []
     *     produces:
     *       - application/json
     *     requestBody:
     *       in: body
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/rules/activate'
     *     responses:
     *       200:
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *             required:
     *               - amount
     *               - plan
     *             properties:
     *               amount:
     *                 type: number
     *               plan:
     *                 type: number
     */
    namespace.post('/activate', activateRules, createRouteHandler(methods.activate))

    root.use('/gift-certificate', namespace)
  }
}

export const buildGiftCertificateHandler = (params: Params): IHandler => {
  return {
    registerRoutes: buildRegisterRoutes(
      {
        create: buildCreate(params),
        activate: buildActivate(params),
      },
      params.middlewares,
    ),
  }
}
