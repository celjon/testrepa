import { AdapterParams } from '@/adapter/types'

type Params = Pick<AdapterParams, 'g4f'>

type G4FProvider = {
  id: string
  object: 'provider'
  created: number
  url: string
  label: string
}

export type GetProviders = () => Promise<Array<G4FProvider>>

export const buildGetProviders = ({ g4f }: Params): GetProviders => {
  return async () => {
    return await g4f.client.getProviders()
  }
}
