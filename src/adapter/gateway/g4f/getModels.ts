import { AdapterParams } from '@/adapter/types'

type Params = Pick<AdapterParams, 'g4f'>

type G4FModel = {
  id: string
  object: 'model'
  created: number
  owned_by: string
  image: boolean
  vision: boolean
}

export type GetModels = (provider?: string) => Promise<Array<G4FModel>>

export const buildGetModels = ({ g4f }: Params): GetModels => {
  return async (provider) => {
    return await g4f.client.getModels(provider)
  }
}
