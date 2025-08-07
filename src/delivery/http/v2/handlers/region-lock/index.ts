import { IHandler } from '../types'
import Express from 'express'
import { createRouteHandler } from '../../routeHandler'
import { DeliveryParams } from '@/delivery/types'
import { Middlewares } from '../../middlewares'
import { buildGetCountry, GetCountry } from './get-country'
import { buildRegionLockRules } from './rules'

type Params = Pick<DeliveryParams, 'geoGateway' | 'middlewares'>

export type ReferralTemplateMethods = {
  getCountry: GetCountry
}

const buildRegisterRoutes = (methods: ReferralTemplateMethods, middlewares: Middlewares) => {
  const { getCountryRules } = buildRegionLockRules(middlewares)

  return (root: Express.Router) => {
    const namespace = Express.Router()

    /**
     * @openapi
     * /region-lock/country/{ip}:
     *   get:
     *     tags: [Region Lock]
     *     security:
     *      - bearerAuth: []
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: ip
     *         in: path
     *         required: true
     *         type: string
     *     responses:
     *       200:
     *         content:
     *           application/json:
     *             schema:
     *               properties:
     *                 countryCode: string
     */
    namespace.get('/country/:ip', getCountryRules, createRouteHandler(methods.getCountry))

    root.use('/region-lock', namespace)
  }
}

export const buildRegionLockHandler = (params: Params): IHandler => {
  const getCountry = buildGetCountry(params)

  return {
    registerRoutes: buildRegisterRoutes(
      {
        getCountry,
      },
      params.middlewares,
    ),
  }
}
