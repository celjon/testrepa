import { buildDetermineLocation, DetermineLocation } from './determine-location'

export type GeoGateway = {
  determineLocation: DetermineLocation
}

export const buildGeoGateway = (): GeoGateway => {
  const determineLocation = buildDetermineLocation()

  return {
    determineLocation,
  }
}
