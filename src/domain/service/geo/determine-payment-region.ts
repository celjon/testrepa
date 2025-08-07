import { Adapter } from '@/domain/types'
import { Region } from '@prisma/client'

type Params = Pick<Adapter, 'geoGateway'>

export type DeterminePaymentRegion = (params: { ip: string }) => Promise<Region>

export const buildDeterminePaymentRegion = ({ geoGateway }: Params): DeterminePaymentRegion => {
  return async ({ ip }) => {
    const ipMetadata = await geoGateway.determineLocation(ip)

    if (
      ipMetadata?.country?.iso_code === 'RU' ||
      ipMetadata?.registered_country?.iso_code === 'RU'
    ) {
      return Region.RU
    }

    if (
      ipMetadata?.country?.iso_code === 'KZ' ||
      ipMetadata?.registered_country?.iso_code === 'KZ'
    ) {
      return Region.KZ
    }

    return Region.GLOBAL
  }
}
