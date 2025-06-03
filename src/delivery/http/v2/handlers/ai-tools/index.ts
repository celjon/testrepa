import Express from 'express'
import { DeliveryParams } from '@/delivery/types'
import { createRouteHandler } from '../../routeHandler'
import { Middlewares } from '../../middlewares'
import { IHandler } from '../types'
import { buildAIToolsRules } from './rules'
import { buildCompletions, Completions } from './completions'

type Params = Pick<DeliveryParams, 'aiTools' | 'middlewares'>

export type AIToolsMethods = {
  completions: Completions
}

const buildRegisterRoutes = (methods: AIToolsMethods, middlewares: Middlewares) => {
  const { completionRules } = buildAIToolsRules(middlewares)

  return (root: Express.Router) => {
    const namespace = Express.Router()

    namespace.post('/chat/completions', completionRules, createRouteHandler(methods.completions))

    root.use('/ai-tools/v1', namespace)
  }
}

export const buildAIToolsHandler = (params: Params): IHandler => {
  return {
    registerRoutes: buildRegisterRoutes(
      {
        completions: buildCompletions(params)
      },
      params.middlewares
    )
  }
}
