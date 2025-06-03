import { describe, expect, it } from '@jest/globals'
import { buildGeoGateway } from '@/adapter/gateway/geo'
import { buildDeterminePaymentRegion } from './determinePaymentRegion'

describe('determinePaymentRegion', () => {
  const geoGateway = buildGeoGateway()
  const determinePaymentRegion = buildDeterminePaymentRegion({
    geoGateway
  })

  it('should return the OTHER payment region for a given IP address', async () => {
    const region = await determinePaymentRegion({ ip: '135.181.144.238' })
    expect(region).toBe('OTHER')
  })

  it('should return the KZ payment region for a given IP address', async () => {
    const region = await determinePaymentRegion({ ip: '103.241.111.239' })
    expect(region).toBe('KZ')
  })

  it('should return the RU payment region for a given IP address', async () => {
    const region = await determinePaymentRegion({ ip: '103.76.52.117' })
    expect(region).toBe('RU')
  })
})
