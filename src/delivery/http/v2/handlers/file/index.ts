import { DeliveryParams } from '@/delivery/types'
import { IHandler } from '../types'
import { buildDecrypt, Decrypt } from './decrypt'
import { Middlewares } from '../../middlewares'
import Express from 'express'
import { buildFileRules } from './rules'
import { createRouteHandler } from '../../routeHandler'

type Params = Pick<DeliveryParams, 'file' | 'middlewares'>

export type FileMethods = {
  decrypt: Decrypt
}

const buildRegisterRoutes = (methods: FileMethods, middlewares: Middlewares) => {
  const { decryptRules } = buildFileRules(middlewares)

  return (root: Express.Router) => {
    const namespace = Express.Router()

    /**
     * @openapi
     * /file/decrypt/{fileId}:
     *   get:
     *     tags: [File]
     *     security:
     *      - bearerAuth: []
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: fileId
     *         in: path
     *         required: true
     *         type: string
     *     responses:
     *        200:
     *           description: Successful request
     *           content:
     *              application/json:
     *                schema:
     *                      $ref: '#/components/entities/File'
     */
    namespace.get('/decrypted/:fileId', decryptRules, createRouteHandler(methods.decrypt))

    root.use('/file', namespace)
  }
}

export const buildFileHandler = (params: Params): IHandler => {
  const decrypt = buildDecrypt(params)

  return {
    registerRoutes: buildRegisterRoutes(
      {
        decrypt
      },
      params.middlewares
    )
  }
}
