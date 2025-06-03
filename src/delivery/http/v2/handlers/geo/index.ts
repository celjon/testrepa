import { DeliveryParams } from '@/delivery/types'
import Express from 'express'
import { IHandler } from '../types'
import { buildGet, Get } from './get'
import { createRouteHandler } from '../../routeHandler'

type Params = DeliveryParams

export type GeoMethods = {
  get: Get
}

export const buildRegisterRoutes = (methods: GeoMethods) => {
  return (root: Express.Router) => {
    const namespace = Express.Router()

    namespace.get('/', createRouteHandler(methods.get))

    root.use('/geo', namespace)
  }
}

export const buildGeoHandler = (params: Params): IHandler => {
  const get = buildGet(params)

  return {
    registerRoutes: buildRegisterRoutes({
      get
    })
  }
}
