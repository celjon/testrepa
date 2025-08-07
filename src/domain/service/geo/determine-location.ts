import { ICountryResponse } from '@/domain/dto'
import { Adapter } from '@/domain/types'

type Params = Pick<Adapter, 'geoGateway'>

export type DetermineLocation = (params: { ip: string }) => Promise<ICountryResponse | null>

export const buildDetermineLocation = ({ geoGateway }: Params): DetermineLocation => {
  return async ({ ip }) => {
    return geoGateway.determineLocation(ip)
  }
}
