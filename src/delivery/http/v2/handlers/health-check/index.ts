import Express from 'express'
import { DeliveryParams } from '@/delivery/types'
import { Middlewares } from '../../middlewares'
import { IHandler } from '../types'
import { createRouteHandler } from '../../routeHandler'
import { buildHealthCheckRules } from './rules'
import { buildHealthCheckHandlers } from './handlers'

type Params = Pick<DeliveryParams, 'healthCheckGateway' | 'middlewares'>

export type HealthCheckMethods = ReturnType<typeof buildHealthCheckHandlers>

const buildRegisterRoutes = (methods: HealthCheckMethods, middlewares: Middlewares) => {
  const { healthCheckRules } = buildHealthCheckRules(middlewares)

  return (root: Express.Router) => {
    const namespace = Express.Router()

    namespace.get('/db', healthCheckRules, createRouteHandler(methods.checkDB))
    namespace.get('/event-loop-lag', healthCheckRules, createRouteHandler(methods.getEventLoopLag))
    namespace.get('/event-loop-utilization', healthCheckRules, createRouteHandler(methods.getEventLoopUtilization))
    namespace.get('/memory-usage', healthCheckRules, createRouteHandler(methods.getMemoryUsage))

    root.use('/health-check', namespace)
  }
}

export const buildHealthCheckHandler = (params: Params): IHandler => {
  return {
    registerRoutes: buildRegisterRoutes(
      {
        ...buildHealthCheckHandlers(params)
      },
      params.middlewares
    )
  }
}
