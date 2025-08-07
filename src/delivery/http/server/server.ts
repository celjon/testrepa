import Express from 'express'
import { config as cfg } from '@/config/index'

const buildStart = (app: Express.Express) => {
  return (router: Express.Router) => {
    app.use('/api/v1', router)
    app.use('/api/v2', router)

    const server = app.listen(cfg.http.port, cfg.http.host)

    const stop = () => {
      server.close()
    }

    return stop
  }
}

export const buildServer = () => {
  const app = Express()

  return {
    start: buildStart(app),
  }
}
