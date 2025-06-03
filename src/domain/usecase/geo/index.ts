import { UseCaseParams } from '../types'
import { buildGet, Get } from './get'

export type GeoUseCase = {
  get: Get
}

export const buildGeoUseCase = (params: UseCaseParams): GeoUseCase => {
  const get = buildGet(params)

  return {
    get
  }
}
