import Express from 'express'
import cors from 'cors'
import busboy from 'connect-busboy'
import { devMode } from '@/config'
import { buildSwagger } from '../swagger'
import { buildTemplatePreview } from '@/adapter/gateway/mail/build-template-preview'
import { buildServeEmailAssets } from '@/adapter/gateway/mail/build-serve-email-assets'
import { Middlewares } from '../middlewares'
import { StripeRawRequest } from '../handlers/types'

export const buildRouter = (handler: Express.Router, { logger: loggerMiddleware }: Middlewares) => {
  const router = Express.Router()

  router.use(cors())
  router.use(busboy())
  router.use(
    Express.json({
      limit: '20mb',
      verify: (req, _, buf) => {
        const url = req.url
        if (url?.includes('stripe')) {
          ;(req as StripeRawRequest).rawBody = buf.toString()
        }
      }
    })
  )

  router.use(loggerMiddleware)
  router.use(handler)
  router.use(buildSwagger())

  router.use(buildServeEmailAssets())
  if (devMode) {
    router.use(buildTemplatePreview())
  }

  return router
}
