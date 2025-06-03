import { buildDetermineLocation, DetermineLocation } from './determineLocation'

export type GeoGateway = {
  determineLocation: DetermineLocation
}

export const buildGeoGateway = (): GeoGateway => {
  const determineLocation = buildDetermineLocation()

  return {
    determineLocation
  }
}
