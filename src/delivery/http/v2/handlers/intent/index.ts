import Express from 'express'
import { DeliveryParams } from '@/delivery/types'
import { Middlewares } from '../../middlewares'
import { createRouteHandler } from '../../routeHandler'
import { IHandler } from '../types'
import { buildDetermineRules } from './rules'
import { buildDetermineIntent, DetermineIntent } from './determine'

type Params = Pick<DeliveryParams, 'intent' | 'middlewares'>

export type IntentMethods = {
  determine: DetermineIntent
}

const buildRegisterRoutes =
  (methods: IntentMethods, middlewares: Middlewares) => (root: Express.Router) => {
    const namespace = Express.Router()
    const determineRules = buildDetermineRules(middlewares)

    /**
     * @openapi
     * /intent/analyze:
     *   post:
     *     tags: [Intent]
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
     *               message:
     *                 type: string
     *                 description: Text content to analyze
     *         multipart/form-data:
     *           schema:
     *             type: object
     *             properties:
     *               audio:
     *                 type: string
     *                 format: binary
     *     responses:
     *       200:
     *         description: Intent analysis result
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 type:
     *                   type: string
     *                   enum: [TEXT, IMAGE, VIDEO, AUDIO, WEB_SEARCH]
     *                   description: Determined intent type
     *                 confidence:
     *                   type: number
     *                   format: float
     *                   description: Confidence score (0-1)
     */
    namespace.post(
      '/determine',
      middlewares.fileUpload({ saveFiles: false }).single('audio'),
      ...determineRules,
      createRouteHandler(methods.determine),
    )

    root.use('/intent', namespace)
  }

export const buildIntentHandler = (params: Params): IHandler => {
  return {
    registerRoutes: buildRegisterRoutes(
      {
        determine: buildDetermineIntent(params),
      },
      params.middlewares,
    ),
  }
}
