import { buildYoomoney, Yoomoney } from './yoomoney'
import { buildHashbon, Hashbon } from './hashbon'
import { IHandler } from '../types'
import { createRouteHandler } from '../../routeHandler'
import { buildWebhookRules } from './rules'
import Express from 'express'
import { DeliveryParams } from '@/delivery/types'
import { buildTinkoff, Tinkoff } from './tinkoff'
import { buildStripe, Stripe } from './stripe'
import { Middlewares } from '../../middlewares'

type Params = Pick<DeliveryParams, 'webhook' | 'middlewares'>

export type WebhookMethods = {
  yoomoney: Yoomoney
  hashbon: Hashbon
  tinkoff: Tinkoff
  stripe: Stripe
}

const buildRegisterRoutes = (methods: WebhookMethods, middlewares: Middlewares) => {
  const { hashbonRules, tinkoffRules, yoomoneyRules } = buildWebhookRules(middlewares)

  return (root: Express.Router) => {
    const namespace = Express.Router()
    namespace.post('/yoomoney', yoomoneyRules, createRouteHandler(methods.yoomoney))
    namespace.post('/hashbon', hashbonRules, createRouteHandler(methods.hashbon))
    namespace.post('/tinkoff', tinkoffRules, createRouteHandler(methods.tinkoff))
    namespace.post('/stripe', createRouteHandler(methods.stripe))
    root.use('/webhook', namespace)
  }
}

export const buildWebhookHandler = (params: Params): IHandler => {
  const yoomoney = buildYoomoney(params)
  const hashbon = buildHashbon(params)
  const tinkoff = buildTinkoff(params)

  return {
    registerRoutes: buildRegisterRoutes(
      {
        yoomoney,
        hashbon,
        tinkoff,
        stripe: buildStripe(params),
      },
      params.middlewares,
    ),
  }
}
