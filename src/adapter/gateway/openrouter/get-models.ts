import { AdapterParams } from '@/adapter/types'
import { IOpenRouterModel } from '@/lib/clients/openrouter'

type Params = Pick<AdapterParams, 'openRouter'>

export type GetModels = () => Promise<IOpenRouterModel[]>

export const buildGetModels = ({ openRouter }: Params): GetModels => {
  return async () => {
    return openRouter.client.getModels()
  }
}
