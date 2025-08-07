import { UseCaseParams } from '../types'
import { buildGet, Get } from './get'
import { buildStop, Stop } from './stop'

export type JobUseCase = {
  get: Get
  stop: Stop
}

export const buildJobUseCase = (params: UseCaseParams) => {
  const get = buildGet(params)
  const stop = buildStop(params)

  return {
    get,
    stop,
  }
}
