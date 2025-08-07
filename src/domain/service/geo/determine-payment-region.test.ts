import { describe, expect, it } from 'vitest'
import { buildGeoGateway } from '@/adapter/gateway/geo'
import { buildDeterminePaymentRegion } from './determine-payment-region'

describe('determinePaymentRegion', () => {
  const geoGateway = buildGeoGateway()
  const determinePaymentRegion = buildDeterminePaymentRegion({
    geoGateway,
  })

  it('should return the GLOBAL payment region for a given IP address', async () => {
    const region = await determinePaymentRegion({ ip: '135.181.144.238' })
    expect(region).toBe('GLOBAL')
  })

  it('should return the KZ payment region for a given IP address', async () => {
    const region = await determinePaymentRegion({ ip: '213.148.13.13' })
    expect(region).toBe('KZ')
  })

  it('should return the RU payment region for a given IP address', async () => {
    const region = await determinePaymentRegion({ ip: '103.76.52.117' })
    expect(region).toBe('RU')
  })
})
