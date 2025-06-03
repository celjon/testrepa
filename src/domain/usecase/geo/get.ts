import { ICountryResponse } from '@/domain/dto'
import { UseCaseParams } from '../types'

type Params = Pick<UseCaseParams, 'service'>

export type Get = (params: { ip: string }) => Promise<ICountryResponse | null>

export const buildGet = ({ service }: Params): Get => {
  return async ({ ip }) => {
    return service.geo.determineLocation({ ip })
  }
}
