import Express from 'express'

export const buildServeEmailAssets = () => {
  const router = Express.Router()

  router.use('/email-assets', Express.static('email-templates/assets'))

  return router
}
