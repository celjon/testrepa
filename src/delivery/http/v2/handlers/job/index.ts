import { DeliveryParams } from '@/delivery/types'
import { buildGet, Get } from './get'
import { buildStop, Stop } from './stop'
import Express from 'express'
import { Middlewares } from '../../middlewares'
import { createRouteHandler } from '../../routeHandler'
import { IHandler } from '../types'

type Params = Pick<DeliveryParams, 'job' | 'middlewares'>

export type JobMethods = {
  get: Get
  stop: Stop
}

const buildRegisterRoutes =
  (methods: JobMethods, { authRequired }: Middlewares) =>
  (root: Express.Router) => {
    const namespace = Express.Router()

    /**
     * @openapi
     * /job/{id}:
     *   get:
     *     security:
     *      - bearerAuth: []
     *     tags: [Job]
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: id
     *         in: path
     *         required: true
     *         type: string
     *     responses:
     *        200:
     *           content:
     *              application/json:
     *                schema:
     *                      $ref: '#/components/entities/Job'
     */
    namespace.get('/:id', authRequired(), createRouteHandler(methods.get))

    /**
     * @openapi
     * /job/{id}/stop:
     *   post:
     *     security:
     *      - bearerAuth: []
     *     tags: [Job]
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: id
     *         in: path
     *         required: true
     *         type: string
     *     responses:
     *        200:
     *           content:
     *              application/json:
     *                schema:
     *                      $ref: '#/components/entities/Job'
     */
    namespace.post('/:id/stop', authRequired(), createRouteHandler(methods.stop))

    root.use('/job', namespace)
  }

export const buildJobHandler = (params: Params): IHandler => {
  const get = buildGet(params)
  const stop = buildStop(params)

  return {
    registerRoutes: buildRegisterRoutes(
      {
        get,
        stop,
      },
      params.middlewares,
    ),
  }
}
