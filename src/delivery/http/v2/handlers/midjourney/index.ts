import { IHandler } from '../types'
import Express from 'express'
import { createRouteHandler } from '../../routeHandler'
import { DeliveryParams } from '@/delivery/types'
import { Middlewares } from '@/delivery/http/v2/middlewares'
import { buildGetDiscordAccounts, GetDiscordAccounts } from './getDiscordAccounts'
import { config } from '@/config'

type Params = Pick<DeliveryParams, 'midjourney' | 'middlewares'>

export type MidjourneyMethods = {
  getDiscordAccounts: GetDiscordAccounts
}

const buildRegisterRoutes =
  (methods: MidjourneyMethods, { allowedIps, authRequired }: Middlewares) =>
  (root: Express.Router) => {
    const namespace = Express.Router()

    namespace.get(
      '/discord-account/list',
      allowedIps(config.admin.allowed_ips),
      authRequired(),
      createRouteHandler(methods.getDiscordAccounts)
    )

    root.use('/midjourney', namespace)
  }

export const buildMidjourneyHandler = (params: Params): IHandler => {
  const getDiscordAccounts = buildGetDiscordAccounts(params)

  return {
    registerRoutes: buildRegisterRoutes(
      {
        getDiscordAccounts
      },
      params.middlewares
    )
  }
}
