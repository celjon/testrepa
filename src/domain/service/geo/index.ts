import { Adapter } from '@/domain/types'
import { buildDetermineLocation, DetermineLocation } from './determineLocation'
import { buildDeterminePaymentRegion, DeterminePaymentRegion } from './determinePaymentRegion'

export type GeoService = {
  determineLocation: DetermineLocation
  determinePaymentRegion: DeterminePaymentRegion
}

export const buildGeoService = (params: Adapter): GeoService => {
  const determineLocation = buildDetermineLocation(params)
  const determinePaymentRegion = buildDeterminePaymentRegion(params)

  return {
    determineLocation,
    determinePaymentRegion
  }
}
