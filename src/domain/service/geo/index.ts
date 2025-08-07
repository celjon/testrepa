import { Adapter } from '@/domain/types'
import { buildDetermineLocation, DetermineLocation } from './determine-location'
import { buildDeterminePaymentRegion, DeterminePaymentRegion } from './determine-payment-region'

export type GeoService = {
  determineLocation: DetermineLocation
  determinePaymentRegion: DeterminePaymentRegion
}

export const buildGeoService = (params: Adapter): GeoService => {
  const determineLocation = buildDetermineLocation(params)
  const determinePaymentRegion = buildDeterminePaymentRegion(params)

  return {
    determineLocation,
    determinePaymentRegion,
  }
}
