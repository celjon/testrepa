import maxmind, { CountryResponse, Reader } from 'maxmind'
import { mmdbPath } from '@/adapter/consts'

let lookup: Reader<CountryResponse> | null = null

const getLookup = async () => {
  if (!lookup) {
    lookup = await maxmind.open<CountryResponse>(mmdbPath)
  }
  return lookup
}

export type DetermineLocation = (ip: string) => Promise<CountryResponse | null>

export const buildDetermineLocation = (): DetermineLocation => {
  return async (ip) => {
    const lookup = await getLookup()
    return lookup.get(ip)
  }
}
